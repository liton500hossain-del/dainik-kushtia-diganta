import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase, hashPassword, verifyPassword } from './db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const apiRouter = Router();

// Sessions in-memory store
const sessions = new Map<string, { userId: number; role: string; email: string; fullName: string; expires: number }>();

// Simple in-memory rate limiter for login
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (!attempt) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  if (now - attempt.firstAttempt > 60000) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  if (attempt.count >= 5) {
    return false;
  }
  attempt.count++;
  return true;
}

// Auth Middleware
export function authenticate(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.cookies?.session_token as string);
  if (!token) {
    res.status(401).json({ error: 'প্রবেশাধিকার নেই: অনুগ্রহ করে লগইন করুন (Unauthorized)' });
    return;
  }
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    res.status(401).json({ error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে: পুনরায় লগইন করুন' });
    return;
  }
  (req as any).user = session;
  next();
}

export function authorizeRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: () => void) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'এই কার্যক্রম পরিচালনার অনুমতি আপনার নেই (Forbidden)' });
      return;
    }
    next();
  };
}

// Log admin action
function logAudit(userId: number, userName: string, action: string, entityType: string, entityId: string, details: string, ip: string) {
  try {
    getDatabase().then(db => {
      db.run(`
        INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [userId, userName, action, entityType, entityId, details, ip]);
      saveDatabase();
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// Helper: Query DB and return array of objects
function queryAll(db: any, sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryFirst(db: any, sql: string, params: any[] = []): any | null {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Bootstrap public portal: Site settings, categories, breaking news, active ads
apiRouter.get('/public/bootstrap', async (_req, res) => {
  try {
    const db = await getDatabase();
    
    // Settings
    const rawSettings = queryAll(db, "SELECT key, value FROM site_settings");
    const settings: Record<string, string> = {};
    for (const s of rawSettings) {
      settings[s.key] = s.value;
    }

    // Categories
    const categories = queryAll(db, `
      SELECT id, name_bn, name_en, slug, sort_order, in_navbar
      FROM categories
      WHERE is_active = 1
      ORDER BY sort_order ASC
    `);

    // Breaking news
    const breakingNews = queryAll(db, `
      SELECT bn.id, bn.title, bn.article_id, bn.external_url, bn.priority,
             a.slug as article_slug
      FROM breaking_news bn
      LEFT JOIN articles a ON bn.article_id = a.id
      WHERE bn.is_active = 1
      ORDER BY bn.priority ASC, bn.created_at DESC
    `);

    // Active Ads
    const ads = queryAll(db, `
      SELECT slot_key, name, ad_type, banner_image, target_url, custom_code, device_target
      FROM ad_placements
      WHERE is_active = 1
    `);
    const adsMap: Record<string, any> = {};
    for (const ad of ads) {
      adsMap[ad.slot_key] = ad;
    }

    res.json({
      settings,
      categories,
      breakingNews,
      ads: adsMap
    });
  } catch (err: any) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: 'সাইট ডাটা লোড করতে সমস্যা হয়েছে' });
  }
});

// Public Articles list (Search, Filter by Category, Pagination)
apiRouter.get('/public/articles', async (req, res) => {
  try {
    const db = await getDatabase();
    const categorySlug = req.query.category as string;
    const tag = req.query.tag as string;
    const search = req.query.search as string;
    const isFeatured = req.query.featured === 'true';
    const isBreaking = req.query.breaking === 'true';
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;

    let whereClauses = ["a.status = 'published'"];
    let params: any[] = [];

    if (categorySlug) {
      whereClauses.push("c.slug = ?");
      params.push(categorySlug);
    }

    if (tag) {
      whereClauses.push("a.tags LIKE ?");
      params.push(`%${tag}%`);
    }

    if (search && search.trim()) {
      whereClauses.push("(a.title LIKE ? OR a.sub_title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (isFeatured) {
      whereClauses.push("a.is_featured = 1");
    }

    if (isBreaking) {
      whereClauses.push("a.is_breaking = 1");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count
    const countSql = `
      SELECT COUNT(*) as total
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      ${whereSql}
    `;
    const countRow = queryFirst(db, countSql, params);
    const total = countRow ? countRow.total : 0;

    // Articles
    const selectSql = `
      SELECT a.id, a.title, a.sub_title, a.slug, a.excerpt, a.featured_image,
             a.image_caption, a.image_credit, a.reporter_name, a.is_featured,
             a.is_breaking, a.views_count, a.published_at, a.tags,
             c.id as category_id, c.name_bn as category_name_bn, c.slug as category_slug
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      ${whereSql}
      ORDER BY a.is_pinned DESC, a.published_at DESC, a.id DESC
      LIMIT ? OFFSET ?
    `;
    const articles = queryAll(db, selectSql, [...params, limit, offset]);

    res.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('Articles list error:', err);
    res.status(500).json({ error: 'সংবাদ তালিকা লোড করা সম্ভব হয়নি' });
  }
});

// Single Article by slug
apiRouter.get('/public/articles/:slug', async (req, res) => {
  try {
    const db = await getDatabase();
    const slug = req.params.slug;

    const article = queryFirst(db, `
      SELECT a.*, c.name_bn as category_name_bn, c.slug as category_slug,
             u.full_name as author_full_name, u.designation as author_designation, u.avatar_url as author_avatar
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.slug = ? AND a.status = 'published'
    `, [slug]);

    if (!article) {
      res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি বা অপ্রকাশিত রয়েছে' });
      return;
    }

    // Related articles in same category
    const related = queryAll(db, `
      SELECT id, title, slug, excerpt, featured_image, published_at, reporter_name
      FROM articles
      WHERE category_id = ? AND id != ? AND status = 'published'
      ORDER BY published_at DESC
      LIMIT 4
    `, [article.category_id, article.id]);

    // Approved comments
    const comments = queryAll(db, `
      SELECT id, author_name, comment_text, created_at
      FROM comments
      WHERE article_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `, [article.id]);

    res.json({
      article,
      related,
      comments
    });
  } catch (err: any) {
    console.error('Single article error:', err);
    res.status(500).json({ error: 'সংবাদ লোড করতে সমস্যা হয়েছে' });
  }
});

// View counter tracking
apiRouter.post('/public/articles/:id/view', async (req, res) => {
  try {
    const db = await getDatabase();
    const id = parseInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }
    db.run("UPDATE articles SET views_count = views_count + 1 WHERE id = ?", [id]);
    saveDatabase();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'View count error' });
  }
});

// Trending / Most-read articles
apiRouter.get('/public/trending', async (_req, res) => {
  try {
    const db = await getDatabase();
    const trending = queryAll(db, `
      SELECT a.id, a.title, a.slug, a.featured_image, a.published_at, a.views_count,
             c.name_bn as category_name_bn, c.slug as category_slug
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published'
      ORDER BY a.views_count DESC, a.published_at DESC
      LIMIT 6
    `);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: 'Trending articles error' });
  }
});

// Post comment
apiRouter.post('/public/articles/:id/comments', async (req, res) => {
  try {
    const db = await getDatabase();
    const articleId = parseInt(req.params.id);
    const { author_name, author_email, comment_text } = req.body;

    if (!author_name || !comment_text) {
      res.status(400).json({ error: 'নাম ও মন্তব্য প্রদান বাধ্যতামূলক' });
      return;
    }

    db.run(`
      INSERT INTO comments (article_id, author_name, author_email, comment_text, status)
      VALUES (?, ?, ?, ?, 'pending')
    `, [articleId, author_name.trim(), (author_email || '').trim(), comment_text.trim()]);
    saveDatabase();

    res.json({ success: true, message: 'আপনার মন্তব্য সফলভাবে জমা হয়েছে। সম্পাদকের অনুমোদনের পর প্রদর্শিত হবে।' });
  } catch (err) {
    res.status(500).json({ error: 'মন্তব্য জমা দিতে ব্যর্থ হয়েছে' });
  }
});

// RSS Feed Generator
apiRouter.get('/rss.xml', async (_req, res) => {
  try {
    const db = await getDatabase();
    const articles = queryAll(db, `
      SELECT a.id, a.title, a.slug, a.excerpt, a.published_at, c.name_bn as category_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT 25
    `);

    const appUrl = process.env.APP_URL || 'https://kushtiadiganta.com';
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>দৈনিক কুষ্টিয়া দিগন্ত</title>
    <link>${appUrl}</link>
    <description>কুষ্টিয়া, খোকসা ও জাতীয় সংবাদভিত্তিক নির্ভরযোগ্য বাংলা ডিজিটাল সংবাদপত্র</description>
    <language>bn-BD</language>
    <atom:link href="${appUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

    for (const art of articles) {
      rss += `    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${appUrl}/article/${art.slug}</link>
      <guid>${appUrl}/article/${art.slug}</guid>
      <pubDate>${new Date(art.published_at).toUTCString()}</pubDate>
      <description><![CDATA[${art.excerpt || art.title}]]></description>
      <category><![CDATA[${art.category_name}]]></category>
    </item>\n`;
    }

    rss += `  </channel>
</rss>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(rss);
  } catch (err) {
    res.status(500).send('RSS generation error');
  }
});

// XML Sitemap Generator
apiRouter.get('/sitemap.xml', async (_req, res) => {
  try {
    const db = await getDatabase();
    const articles = queryAll(db, "SELECT slug, updated_at, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC");
    const categories = queryAll(db, "SELECT slug FROM categories WHERE is_active = 1");
    const appUrl = process.env.APP_URL || 'https://kushtiadiganta.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${appUrl}/latest</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
`;

    for (const cat of categories) {
      xml += `  <url>
    <loc>${appUrl}/category/${cat.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }

    for (const art of articles) {
      xml += `  <url>
    <loc>${appUrl}/article/${art.slug}</loc>
    <lastmod>${new Date(art.updated_at || art.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    }

    xml += `</urlset>`;
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Sitemap generation error');
  }
});

// ==========================================
// 2. AUTHENTICATION & USER MANAGEMENT
// ==========================================

apiRouter.post('/auth/login', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'অতিরিক্ত ব্যর্থ প্রচেষ্টা! ১ মিনিট পর আবার চেষ্টা করুন।' });
    return;
  }

  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন' });
    return;
  }

  try {
    const db = await getDatabase();
    const user = queryFirst(db, "SELECT * FROM users WHERE email = ? AND is_active = 1", [email.trim().toLowerCase()]);
    if (!user) {
      res.status(401).json({ error: 'ভুল ইমেইল অথবা পাসওয়ার্ড' });
      return;
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      res.status(401).json({ error: 'ভুল ইমেইল অথবা পাসওয়ার্ড' });
      return;
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    sessions.set(token, {
      userId: user.id,
      role: user.role,
      email: user.email,
      fullName: user.full_name,
      expires
    });

    logAudit(user.id, user.full_name, 'LOGIN', 'auth', String(user.id), 'সফলভাবে লগইন করেছেন', ip);

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        designation: user.designation,
        avatarUrl: user.avatar_url
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'লগইন প্রক্রিয়ায় অভ্যন্তরীণ ত্রুটি হয়েছে' });
  }
});

apiRouter.post('/auth/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.cookies?.session_token as string);
  if (token) sessions.delete(token);
  res.clearCookie('session_token');
  res.json({ success: true });
});

apiRouter.get('/auth/me', authenticate, async (req, res) => {
  const sessionUser = (req as any).user;
  const db = await getDatabase();
  const user = queryFirst(db, "SELECT id, email, role, full_name, designation, bio, avatar_url FROM users WHERE id = ?", [sessionUser.userId]);
  if (!user) {
    res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });
    return;
  }
  res.json({ user });
});

// Super Admin: List users
apiRouter.get('/admin/users', authenticate, authorizeRole(['super_admin']), async (_req, res) => {
  const db = await getDatabase();
  const users = queryAll(db, "SELECT id, email, role, full_name, designation, is_active, created_at FROM users ORDER BY id ASC");
  res.json(users);
});

// Super Admin: Create user
apiRouter.post('/admin/users', authenticate, authorizeRole(['super_admin']), async (req, res) => {
  const { email, password, role, full_name, designation } = req.body;
  if (!email || !password || !role || !full_name) {
    res.status(400).json({ error: 'সকল তথ্য সঠিকভাবে পূরণ করুন' });
    return;
  }
  const db = await getDatabase();
  const existing = queryFirst(db, "SELECT id FROM users WHERE email = ?", [email.trim().toLowerCase()]);
  if (existing) {
    res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতোমধ্যে ব্যবহারকারী তৈরি করা আছে' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  db.run(`
    INSERT INTO users (email, password_hash, salt, role, full_name, designation)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [email.trim().toLowerCase(), hash, salt, role, full_name.trim(), designation || '']);
  saveDatabase();

  res.json({ success: true, message: 'নতুন ব্যবহারকারী সফলভাবে তৈরি হয়েছে' });
});

// ==========================================
// 3. ADMIN NEWS MANAGEMENT
// ==========================================

apiRouter.get('/admin/articles', authenticate, async (req, res) => {
  const db = await getDatabase();
  const user = (req as any).user;
  const status = req.query.status as string;

  let sql = `
    SELECT a.id, a.title, a.slug, a.status, a.is_featured, a.is_breaking,
           a.views_count, a.published_at, a.created_at, a.reporter_name,
           c.name_bn as category_name_bn, u.full_name as author_name
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.author_id = u.id
  `;
  const params: any[] = [];
  const clauses: string[] = [];

  // Reporters only see their own articles unless elevated
  if (user.role === 'reporter') {
    clauses.push("a.author_id = ?");
    params.push(user.userId);
  }

  if (status && status !== 'all') {
    clauses.push("a.status = ?");
    params.push(status);
  }

  if (clauses.length > 0) {
    sql += ` WHERE ${clauses.join(' AND ')}`;
  }

  sql += ` ORDER BY a.created_at DESC`;

  const articles = queryAll(db, sql, params);
  res.json(articles);
});

apiRouter.get('/admin/articles/:id', authenticate, async (req, res) => {
  const db = await getDatabase();
  const id = parseInt(req.params.id);
  const article = queryFirst(db, "SELECT * FROM articles WHERE id = ?", [id]);
  if (!article) {
    res.status(404).json({ error: 'সংবাদ পাওয়া যায়নি' });
    return;
  }
  const revisions = queryAll(db, `
    SELECT r.id, r.title, r.note, r.created_at, u.full_name as editor_name
    FROM article_revisions r
    JOIN users u ON r.updated_by = u.id
    WHERE r.article_id = ?
    ORDER BY r.created_at DESC
  `, [id]);

  res.json({ article, revisions });
});

apiRouter.post('/admin/articles', authenticate, async (req, res) => {
  const user = (req as any).user;
  const {
    title, sub_title, slug, excerpt, content, featured_image,
    image_caption, image_credit, category_id, tags, reporter_name,
    status, is_featured, is_breaking, is_pinned, seo_title, seo_description
  } = req.body;

  if (!title || !content || !category_id) {
    res.status(400).json({ error: 'শিরোনাম, মূল সংবাদ এবং বিভাগ নির্বাচন আবশ্যক' });
    return;
  }

  // Reporter can only save as draft or pending_review
  let finalStatus = status || 'draft';
  if (user.role === 'reporter' && (finalStatus === 'published' || finalStatus === 'archived')) {
    finalStatus = 'pending_review';
  }

  // Generate unique slug if not provided
  let generatedSlug = (slug || title)
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!generatedSlug) {
    generatedSlug = `news-${Date.now()}`;
  } else {
    generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`;
  }

  const db = await getDatabase();
  const publishedAt = finalStatus === 'published' ? new Date().toISOString() : null;

  db.run(`
    INSERT INTO articles (
      title, sub_title, slug, excerpt, content, featured_image,
      image_caption, image_credit, category_id, tags, author_id,
      reporter_name, status, is_featured, is_breaking, is_pinned,
      seo_title, seo_description, published_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `, [
    title.trim(), sub_title || '', generatedSlug, excerpt || '', content, featured_image || '',
    image_caption || '', image_credit || '', category_id, tags || '', user.userId,
    reporter_name || user.fullName, finalStatus, is_featured ? 1 : 0, is_breaking ? 1 : 0, is_pinned ? 1 : 0,
    seo_title || title, seo_description || excerpt || '', publishedAt
  ]);
  saveDatabase();

  const inserted = queryFirst(db, "SELECT last_insert_rowid() as id");
  const newArticleId = inserted.id;

  logAudit(user.userId, user.fullName, 'CREATE_ARTICLE', 'article', String(newArticleId), `নতুন সংবাদ তৈরি: ${title}`, req.ip || '');

  // Facebook auto-publishing trigger if published
  if (finalStatus === 'published') {
    handleFacebookPublishing(db, newArticleId, title, generatedSlug, excerpt, featured_image);
  }

  res.json({ success: true, articleId: newArticleId, slug: generatedSlug });
});

apiRouter.put('/admin/articles/:id', authenticate, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id);
  const db = await getDatabase();

  const existing = queryFirst(db, "SELECT * FROM articles WHERE id = ?", [id]);
  if (!existing) {
    res.status(404).json({ error: 'সংবাদ পাওয়া যায়নি' });
    return;
  }

  if (user.role === 'reporter' && existing.author_id !== user.userId) {
    res.status(403).json({ error: 'অন্যের সংবাদ সম্পাদনার অনুমতি নেই' });
    return;
  }

  const {
    title, sub_title, slug, excerpt, content, featured_image,
    image_caption, image_credit, category_id, tags, reporter_name,
    status, is_featured, is_breaking, is_pinned, seo_title, seo_description,
    correction_notice, revision_note
  } = req.body;

  let finalStatus = status || existing.status;
  if (user.role === 'reporter' && (finalStatus === 'published' || finalStatus === 'archived')) {
    finalStatus = 'pending_review';
  }

  // Save revision history if content or title changed
  if (existing.title !== title || existing.content !== content) {
    db.run(`
      INSERT INTO article_revisions (article_id, title, content, updated_by, note)
      VALUES (?, ?, ?, ?, ?)
    `, [id, existing.title, existing.content, user.userId, revision_note || 'সংশোধন']);
  }

  const publishedAt = (finalStatus === 'published' && !existing.published_at) 
    ? new Date().toISOString() 
    : existing.published_at;

  db.run(`
    UPDATE articles SET
      title = ?, sub_title = ?, slug = ?, excerpt = ?, content = ?,
      featured_image = ?, image_caption = ?, image_credit = ?, category_id = ?,
      tags = ?, reporter_name = ?, status = ?, is_featured = ?, is_breaking = ?,
      is_pinned = ?, seo_title = ?, seo_description = ?, correction_notice = ?,
      published_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    title || existing.title, sub_title !== undefined ? sub_title : existing.sub_title,
    slug || existing.slug, excerpt !== undefined ? excerpt : existing.excerpt,
    content || existing.content, featured_image !== undefined ? featured_image : existing.featured_image,
    image_caption !== undefined ? image_caption : existing.image_caption,
    image_credit !== undefined ? image_credit : existing.image_credit,
    category_id || existing.category_id, tags !== undefined ? tags : existing.tags,
    reporter_name || existing.reporter_name, finalStatus,
    is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
    is_breaking !== undefined ? (is_breaking ? 1 : 0) : existing.is_breaking,
    is_pinned !== undefined ? (is_pinned ? 1 : 0) : existing.is_pinned,
    seo_title || existing.seo_title, seo_description || existing.seo_description,
    correction_notice !== undefined ? correction_notice : existing.correction_notice,
    publishedAt, id
  ]);
  saveDatabase();

  logAudit(user.userId, user.fullName, 'UPDATE_ARTICLE', 'article', String(id), `সংবাদ হালনাগাদ: ${title}`, req.ip || '');

  // Check if newly published and needs social publish
  if (finalStatus === 'published' && existing.status !== 'published') {
    handleFacebookPublishing(db, id, title || existing.title, slug || existing.slug, excerpt || existing.excerpt, featured_image || existing.featured_image);
  }

  res.json({ success: true, message: 'সংবাদ সফলভাবে সংরক্ষণ হয়েছে' });
});

apiRouter.delete('/admin/articles/:id', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id);
  const db = await getDatabase();

  db.run("DELETE FROM article_revisions WHERE article_id = ?", [id]);
  db.run("DELETE FROM breaking_news WHERE article_id = ?", [id]);
  db.run("DELETE FROM comments WHERE article_id = ?", [id]);
  db.run("DELETE FROM social_shares WHERE article_id = ?", [id]);
  db.run("DELETE FROM articles WHERE id = ?", [id]);
  saveDatabase();

  logAudit(user.userId, user.fullName, 'DELETE_ARTICLE', 'article', String(id), `সংবাদ ডিলিট করা হয়েছে`, req.ip || '');
  res.json({ success: true, message: 'সংবাদ মুছে ফেলা হয়েছে' });
});

// Restore previous revision
apiRouter.post('/admin/articles/:id/restore-revision', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const { revision_id } = req.body;
  const id = parseInt(req.params.id);
  const db = await getDatabase();

  const revision = queryFirst(db, "SELECT * FROM article_revisions WHERE id = ? AND article_id = ?", [revision_id, id]);
  if (!revision) {
    res.status(404).json({ error: 'পূর্বের সংস্করণ পাওয়া যায়নি' });
    return;
  }

  db.run(`
    UPDATE articles SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [revision.title, revision.content, id]);
  saveDatabase();

  res.json({ success: true, message: 'পূর্বের সংস্করণ সফলভাবে ফিরিয়ে আনা হয়েছে' });
});

// ==========================================
// 4. ADMIN CATEGORIES
// ==========================================

apiRouter.get('/admin/categories', authenticate, async (_req, res) => {
  const db = await getDatabase();
  const categories = queryAll(db, `
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `);
  res.json(categories);
});

apiRouter.post('/admin/categories', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const { name_bn, name_en, slug, description, sort_order, in_navbar } = req.body;
  if (!name_bn || !name_en || !slug) {
    res.status(400).json({ error: 'বাংলা নাম, ইংরেজি নাম ও স্লাগ আবশ্যক' });
    return;
  }
  const db = await getDatabase();
  db.run(`
    INSERT INTO categories (name_bn, name_en, slug, description, sort_order, is_active, in_navbar)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `, [name_bn.trim(), name_en.trim(), slug.trim().toLowerCase(), description || '', sort_order || 0, in_navbar ? 1 : 0]);
  saveDatabase();
  res.json({ success: true, message: 'বিভাগ যুক্ত হয়েছে' });
});

apiRouter.put('/admin/categories/:id', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const id = parseInt(req.params.id);
  const { name_bn, name_en, slug, description, sort_order, is_active, in_navbar } = req.body;
  const db = await getDatabase();
  db.run(`
    UPDATE categories SET
      name_bn = ?, name_en = ?, slug = ?, description = ?,
      sort_order = ?, is_active = ?, in_navbar = ?
    WHERE id = ?
  `, [name_bn, name_en, slug, description, sort_order, is_active ? 1 : 0, in_navbar ? 1 : 0, id]);
  saveDatabase();
  res.json({ success: true, message: 'বিভাগ হালনাগাদ হয়েছে' });
});

apiRouter.delete('/admin/categories/:id', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const id = parseInt(req.params.id);
  const targetCategoryId = req.query.reassignTo ? parseInt(req.query.reassignTo as string) : null;
  const db = await getDatabase();

  const countRow = queryFirst(db, "SELECT COUNT(*) as count FROM articles WHERE category_id = ?", [id]);
  if (countRow && countRow.count > 0) {
    if (!targetCategoryId) {
      res.status(400).json({ 
        error: `এই বিভাগে ${countRow.count} টি সংবাদ রয়েছে। বিভাগটি মুছতে হলে বিদ্যমান সংবাদগুলোকে অন্য বিভাগে স্থানান্তর করতে হবে।`,
        requiresReassignment: true
      });
      return;
    }
    db.run("UPDATE articles SET category_id = ? WHERE category_id = ?", [targetCategoryId, id]);
  }

  db.run("DELETE FROM categories WHERE id = ?", [id]);
  saveDatabase();
  res.json({ success: true, message: 'বিভাগ সফলভাবে মুছে ফেলা হয়েছে' });
});

// ==========================================
// 5. BREAKING NEWS MANAGEMENT
// ==========================================

apiRouter.get('/admin/breaking', authenticate, async (_req, res) => {
  const db = await getDatabase();
  const items = queryAll(db, `
    SELECT b.*, a.title as article_title
    FROM breaking_news b
    LEFT JOIN articles a ON b.article_id = a.id
    ORDER BY b.priority ASC, b.created_at DESC
  `);
  res.json(items);
});

apiRouter.post('/admin/breaking', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const { title, article_id, external_url, priority, is_active } = req.body;
  if (!title) {
    res.status(400).json({ error: 'ব্রেকিং হেডলাইন লিখুন' });
    return;
  }
  const db = await getDatabase();
  db.run(`
    INSERT INTO breaking_news (title, article_id, external_url, priority, is_active)
    VALUES (?, ?, ?, ?, ?)
  `, [title.trim(), article_id || null, external_url || null, priority || 1, is_active ? 1 : 0]);
  saveDatabase();
  res.json({ success: true, message: 'ব্রেকিং নিউজ যুক্ত হয়েছে' });
});

apiRouter.put('/admin/breaking/:id', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, article_id, external_url, priority, is_active } = req.body;
  const db = await getDatabase();
  db.run(`
    UPDATE breaking_news SET
      title = ?, article_id = ?, external_url = ?, priority = ?, is_active = ?
    WHERE id = ?
  `, [title, article_id || null, external_url || null, priority || 1, is_active ? 1 : 0, id]);
  saveDatabase();
  res.json({ success: true, message: 'ব্রেকিং নিউজ হালনাগাদ হয়েছে' });
});

apiRouter.delete('/admin/breaking/:id', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const id = parseInt(req.params.id);
  const db = await getDatabase();
  db.run("DELETE FROM breaking_news WHERE id = ?", [id]);
  saveDatabase();
  res.json({ success: true, message: 'ব্রেকিং নিউজ মুছে ফেলা হয়েছে' });
});

// ==========================================
// 6. ADVERTISEMENT MANAGEMENT & ADSTERRA
// ==========================================

apiRouter.get('/admin/ads', authenticate, authorizeRole(['super_admin', 'editor']), async (_req, res) => {
  const db = await getDatabase();
  const ads = queryAll(db, "SELECT * FROM ad_placements ORDER BY id ASC");
  res.json(ads);
});

apiRouter.put('/admin/ads/:slot_key', authenticate, authorizeRole(['super_admin']), async (req, res) => {
  const slotKey = req.params.slot_key;
  const { name, ad_type, banner_image, target_url, custom_code, is_active, device_target, start_date, end_date } = req.body;
  const db = await getDatabase();

  db.run(`
    UPDATE ad_placements SET
      name = ?, ad_type = ?, banner_image = ?, target_url = ?,
      custom_code = ?, is_active = ?, device_target = ?,
      start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE slot_key = ?
  `, [
    name, ad_type, banner_image || '', target_url || '',
    custom_code || '', is_active ? 1 : 0, device_target || 'all',
    start_date || null, end_date || null, slotKey
  ]);
  saveDatabase();

  const user = (req as any).user;
  logAudit(user.userId, user.fullName, 'UPDATE_AD', 'ad_placement', slotKey, `বিজ্ঞাপন স্লট হালনাগাদ: ${slotKey}`, req.ip || '');

  res.json({ success: true, message: 'বিজ্ঞাপন স্লট সংরক্ষণ করা হয়েছে' });
});

// ==========================================
// 7. SITE SETTINGS & MASTHEAD MANAGEMENT
// ==========================================

apiRouter.get('/admin/settings', authenticate, authorizeRole(['super_admin', 'editor']), async (_req, res) => {
  const db = await getDatabase();
  const raw = queryAll(db, "SELECT key, value FROM site_settings");
  const settings: Record<string, string> = {};
  for (const s of raw) {
    settings[s.key] = s.value;
  }
  res.json(settings);
});

apiRouter.put('/admin/settings', authenticate, authorizeRole(['super_admin']), async (req, res) => {
  const settings = req.body;
  const db = await getDatabase();

  for (const [key, value] of Object.entries(settings)) {
    db.run(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `, [key, String(value)]);
  }
  saveDatabase();

  const user = (req as any).user;
  logAudit(user.userId, user.fullName, 'UPDATE_SETTINGS', 'settings', 'all', 'ওয়েবসাইটের সাধারণ সেটিংস পরিবর্তন', req.ip || '');

  res.json({ success: true, message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে' });
});

// ==========================================
// 8. MEDIA LIBRARY & UPLOADS
// ==========================================

const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');

apiRouter.get('/admin/media', authenticate, async (_req, res) => {
  const db = await getDatabase();
  const media = queryAll(db, "SELECT * FROM media_assets ORDER BY created_at DESC");
  res.json(media);
});

apiRouter.post('/admin/media/upload', authenticate, async (req, res) => {
  try {
    const { fileData, fileName, mimeType, altText, caption, credit } = req.body;
    if (!fileData || !fileName || !mimeType) {
      res.status(400).json({ error: 'ছবির ফাইল এবং তথ্য পাওয়া যায়নি' });
      return;
    }

    // Security validation
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedMimes.includes(mimeType)) {
      res.status(400).json({ error: 'শুধুমাত্র JPG, PNG, WEBP অথবা SVG ফরম্যাট অনুমোদিত' });
      return;
    }

    // Decode base64
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 8 * 1024 * 1024) {
      res.status(400).json({ error: 'ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে' });
      return;
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const ext = path.extname(fileName) || '.jpg';
    const safeName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/uploads/${safeName}`;
    const user = (req as any).user;
    const db = await getDatabase();

    db.run(`
      INSERT INTO media_assets (filename, original_name, mime_type, file_size, url, alt_text, caption, credit, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [safeName, fileName, mimeType, buffer.length, publicUrl, altText || '', caption || '', credit || '', user.userId]);
    saveDatabase();

    res.json({
      success: true,
      url: publicUrl,
      filename: safeName
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'ছবি আপলোড করতে ব্যর্থ হয়েছে' });
  }
});

apiRouter.delete('/admin/media/:id', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const id = parseInt(req.params.id);
  const db = await getDatabase();
  const asset = queryFirst(db, "SELECT * FROM media_assets WHERE id = ?", [id]);
  if (!asset) {
    res.status(404).json({ error: 'ছবি পাওয়া যায়নি' });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, asset.filename);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }

  db.run("DELETE FROM media_assets WHERE id = ?", [id]);
  saveDatabase();
  res.json({ success: true, message: 'ছবি মুছে ফেলা হয়েছে' });
});

// Serve uploaded files securely
apiRouter.get('/uploads/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, safeFilename);
  if (!fs.existsSync(filePath)) {
    res.status(404).send('File not found');
    return;
  }
  res.sendFile(filePath);
});

// ==========================================
// 9. FACEBOOK META GRAPH API PUBLISHING
// ==========================================

async function handleFacebookPublishing(db: any, articleId: number, title: string, slug: string, excerpt: string, imageUrl?: string) {
  const rawSettings = queryAll(db, "SELECT key, value FROM site_settings WHERE key IN ('facebook_page_id', 'facebook_access_token', 'auto_facebook_publish')");
  const settings: Record<string, string> = {};
  for (const s of rawSettings) settings[s.key] = s.value;

  if (settings.auto_facebook_publish !== '1') {
    return;
  }

  const pageId = settings.facebook_page_id;
  const accessToken = settings.facebook_access_token;

  if (!pageId || !accessToken) {
    // Record that config is missing
    db.run(`
      INSERT INTO social_shares (article_id, platform, status, error_message, attempts)
      VALUES (?, 'facebook', 'failed', 'ফেসবুক পেজ আইডি অথবা অ্যাক্সেস টোকেন কনফিগার করা নেই। অ্যাডমিন প্যানেল থেকে সেট করুন।', 1)
    `, [articleId]);
    saveDatabase();
    return;
  }

  const appUrl = process.env.APP_URL || 'https://kushtiadiganta.com';
  const articleUrl = `${appUrl}/article/${slug}`;

  try {
    const postUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    const message = `${title}\n\n${excerpt || ''}\n\nবিস্তারিত পড়ুন: ${articleUrl}`;
    
    const params = new URLSearchParams({
      message,
      link: articleUrl,
      access_token: accessToken
    });

    const response = await fetch(postUrl, {
      method: 'POST',
      body: params
    });

    const result = await response.json();

    if (response.ok && result.id) {
      db.run(`
        INSERT INTO social_shares (article_id, platform, status, post_id, response_data, attempts)
        VALUES (?, 'facebook', 'published', ?, ?, 1)
      `, [articleId, result.id, JSON.stringify(result)]);
    } else {
      const errorMsg = result.error?.message || 'ফেসবুক পাবলিশিংয়ে ত্রুটি হয়েছে';
      db.run(`
        INSERT INTO social_shares (article_id, platform, status, error_message, response_data, attempts)
        VALUES (?, 'facebook', 'failed', ?, ?, 1)
      `, [articleId, errorMsg, JSON.stringify(result)]);
    }
    saveDatabase();
  } catch (err: any) {
    db.run(`
      INSERT INTO social_shares (article_id, platform, status, error_message, attempts)
      VALUES (?, 'facebook', 'failed', ?, 1)
    `, [articleId, err.message || 'নেটওয়ার্ক সংযোগ ত্রুটি']);
    saveDatabase();
  }
}

// Manual retry or trigger Facebook share
apiRouter.post('/admin/social/publish-facebook', authenticate, authorizeRole(['super_admin', 'editor']), async (req, res) => {
  const { article_id } = req.body;
  const db = await getDatabase();
  const article = queryFirst(db, "SELECT * FROM articles WHERE id = ?", [article_id]);
  if (!article) {
    res.status(404).json({ error: 'সংবাদ পাওয়া যায়নি' });
    return;
  }

  await handleFacebookPublishing(db, article.id, article.title, article.slug, article.excerpt, article.featured_image);
  
  const latestShare = queryFirst(db, "SELECT * FROM social_shares WHERE article_id = ? ORDER BY id DESC LIMIT 1", [article.id]);
  res.json({ success: true, share: latestShare });
});

apiRouter.get('/admin/social/shares', authenticate, async (_req, res) => {
  const db = await getDatabase();
  const shares = queryAll(db, `
    SELECT s.*, a.title as article_title, a.slug as article_slug
    FROM social_shares s
    JOIN articles a ON s.article_id = a.id
    ORDER BY s.created_at DESC
    LIMIT 50
  `);
  res.json(shares);
});

// ==========================================
// 10. DASHBOARD ANALYTICS & AUDIT LOGS
// ==========================================

apiRouter.get('/admin/analytics', authenticate, async (_req, res) => {
  const db = await getDatabase();
  const totalPublished = queryFirst(db, "SELECT COUNT(*) as c FROM articles WHERE status = 'published'")?.c || 0;
  const totalDrafts = queryFirst(db, "SELECT COUNT(*) as c FROM articles WHERE status = 'draft'")?.c || 0;
  const totalPending = queryFirst(db, "SELECT COUNT(*) as c FROM articles WHERE status = 'pending_review'")?.c || 0;
  const totalViews = queryFirst(db, "SELECT SUM(views_count) as c FROM articles")?.c || 0;
  const totalCategories = queryFirst(db, "SELECT COUNT(*) as c FROM categories WHERE is_active = 1")?.c || 0;

  const topArticles = queryAll(db, `
    SELECT id, title, slug, views_count, published_at
    FROM articles
    WHERE status = 'published'
    ORDER BY views_count DESC
    LIMIT 5
  `);

  const recentLogs = queryAll(db, `
    SELECT * FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 10
  `);

  res.json({
    metrics: {
      totalPublished,
      totalDrafts,
      totalPending,
      totalViews,
      totalCategories
    },
    topArticles,
    recentLogs
  });
});
