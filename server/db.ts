import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kushtia_diganta.sqlite');

let dbInstance: Database | null = null;

// Password hashing utility
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, userSalt, 64).toString('hex');
  return { hash, salt: userSalt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

export function saveDatabase() {
  if (!dbInstance) return;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const binaryArray = dbInstance.export();
  fs.writeFileSync(DB_FILE, Buffer.from(binaryArray));
}

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Error loading existing database, creating fresh:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  initSchema(dbInstance);
  saveDatabase();
  return dbInstance;
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'reporter',
      full_name TEXT NOT NULL,
      designation TEXT,
      bio TEXT,
      avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_bn TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      in_navbar INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      sub_title TEXT,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      featured_image TEXT,
      image_caption TEXT,
      image_credit TEXT,
      category_id INTEGER NOT NULL,
      tags TEXT,
      author_id INTEGER NOT NULL,
      reporter_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_breaking INTEGER NOT NULL DEFAULT 0,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      correction_notice TEXT,
      published_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id),
      FOREIGN KEY (author_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS article_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_by INTEGER NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles (id),
      FOREIGN KEY (updated_by) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS breaking_news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      article_id INTEGER,
      external_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      priority INTEGER NOT NULL DEFAULT 0,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles (id)
    );

    CREATE TABLE IF NOT EXISTS ad_placements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      ad_type TEXT NOT NULL DEFAULT 'custom_code',
      banner_image TEXT,
      target_url TEXT,
      custom_code TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      device_target TEXT NOT NULL DEFAULT 'all',
      start_date DATETIME,
      end_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT,
      caption TEXT,
      credit TEXT,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      post_id TEXT,
      response_data TEXT,
      error_message TEXT,
      attempts INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles (id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles (id)
    );
  `);

  seedInitialData(db);
}

function seedInitialData(db: Database) {
  // Check if users exist
  const res = db.exec("SELECT COUNT(*) as count FROM users");
  const count = res[0]?.values[0]?.[0] || 0;
  if (Number(count) > 0) return;

  // 1. Seed Users (Super Admin, Editor, Reporter)
  const superAdminPass = hashPassword('Kushtia@Diganta2026');
  const editorPass = hashPassword('Editor@Diganta2026');
  const reporterPass = hashPassword('Reporter@Diganta2026');

  db.run(`
    INSERT INTO users (email, password_hash, salt, role, full_name, designation, bio, is_active)
    VALUES 
    (?, ?, ?, 'super_admin', 'প্রধান সম্পাদক', 'প্রধান সম্পাদক ও প্রকাশক', 'দৈনিক কুষ্টিয়া দিগন্তের প্রধান সম্পাদক ও প্রকাশক।', 1),
    (?, ?, ?, 'editor', 'বার্তা সম্পাদক', 'বার্তা সম্পাদক', 'কুষ্টিয়া ও জাতীয় বার্তা ডেস্ক প্রধান।', 1),
    (?, ?, ?, 'reporter', 'খোকসা প্রতিনিধি', 'উপজেলা স্টাফ রিপোর্টার (খোকসা)', 'খোকসা ও গড়াই অববাহিকার সংবাদ প্রতিনিধি।', 1)
  `, [
    'superadmin@kushtiadiganta.com', superAdminPass.hash, superAdminPass.salt,
    'editor@kushtiadiganta.com', editorPass.hash, editorPass.salt,
    'reporter@kushtiadiganta.com', reporterPass.hash, reporterPass.salt
  ]);

  // 2. Seed Categories
  const categories = [
    { bn: 'জাতীয়', en: 'National', slug: 'national', order: 1 },
    { bn: 'কুষ্টিয়া', en: 'Kushtia', slug: 'kushtia', order: 2 },
    { bn: 'খোকসা', en: 'Khoksa', slug: 'khoksa', order: 3 },
    { bn: 'সারাদেশ', en: 'Bangladesh', slug: 'bangladesh', order: 4 },
    { bn: 'খুলনা বিভাগ', en: 'Khulna Division', slug: 'khulna', order: 5 },
    { bn: 'রাজনীতি', en: 'Politics', slug: 'politics', order: 6 },
    { bn: 'অর্থনীতি', en: 'Economy', slug: 'economy', order: 7 },
    { bn: 'আন্তর্জাতিক', en: 'International', slug: 'international', order: 8 },
    { bn: 'খেলাধুলা', en: 'Sports', slug: 'sports', order: 9 },
    { bn: 'বিনোদন', en: 'Entertainment', slug: 'entertainment', order: 10 },
    { bn: 'প্রযুক্তি', en: 'Technology', slug: 'technology', order: 11 },
    { bn: 'শিক্ষা', en: 'Education', slug: 'education', order: 12 },
    { bn: 'স্বাস্থ্য', en: 'Health', slug: 'health', order: 13 },
    { bn: 'মতামত', en: 'Opinion', slug: 'opinion', order: 14 },
    { bn: 'ফিচার', en: 'Features', slug: 'features', order: 15 }
  ];

  for (const cat of categories) {
    db.run(`
      INSERT INTO categories (name_bn, name_en, slug, description, sort_order, is_active, in_navbar)
      VALUES (?, ?, ?, ?, ?, 1, 1)
    `, [cat.bn, cat.en, cat.slug, `${cat.bn} বিভাগের সর্বশেষ খবর ও সংবাদ বিশ্লেষণ`, cat.order]);
  }

  // 3. Seed Site Settings
  const settings: Record<string, string> = {
    'site_name_bn': 'দৈনিক কুষ্টিয়া দিগন্ত',
    'site_name_en': 'Dainik Kushtia Diganta',
    'tagline': 'বস্তুনিষ্ঠ সংবাদে জনতার কণ্ঠস্বর',
    'logo_url': '',
    'favicon_url': '',
    'header_ad_enabled': '1',
    'header_ad_title': 'কুষ্টিয়া শিল্পমেলা ২০২৬',
    'header_ad_image': '',
    'header_ad_link': 'https://kushtiadiganta.com',
    'facebook_page_id': '',
    'facebook_access_token': '',
    'meta_app_id': '',
    'meta_app_secret': '',
    'auto_facebook_publish': '0',
    'weather_widget_enabled': '1',
    'editor_name': 'এম. এ. রহমান',
    'executive_editor': 'কামরুল হাসান',
    'office_address': 'এনএস রোড, থানা মোড়, কুষ্টিয়া সদর, কুষ্টিয়া - ৭০০০',
    'khoksa_office': 'উপজেলা পরিষদ রোড, খোকসা বাজার, খোকসা, কুষ্টিয়া',
    'contact_phone': '+৮৮০ ১৭১২-৩৪৫৬৭৮',
    'contact_email': 'news@kushtiadiganta.com',
    'facebook_url': 'https://facebook.com/kushtiadiganta',
    'youtube_url': 'https://youtube.com/@kushtiadiganta',
    'x_url': 'https://x.com/kushtiadiganta'
  };

  for (const [key, val] of Object.entries(settings)) {
    db.run("INSERT INTO site_settings (key, value) VALUES (?, ?)", [key, val]);
  }

  // 4. Seed Ad Placements
  const adSlots = [
    { key: 'header_banner', name: 'হেডার ব্যানার (ডেস্কটপ ও মোবাইল)', type: 'banner' },
    { key: 'below_nav', name: 'নেভিগেশন বারের নিচে', type: 'custom_code' },
    { key: 'home_section_mid', name: 'হোমপেজ সংবাদ সেকশনের মাঝে', type: 'custom_code' },
    { key: 'sidebar_top', name: 'সাইডবার শীর্ষ ব্যানার', type: 'custom_code' },
    { key: 'sidebar_bottom', name: 'সাইডবার বটম', type: 'custom_code' },
    { key: 'article_in_content', name: 'সংবাদ বডির ভেতরে (ইন-কনটেন্ট)', type: 'custom_code' },
    { key: 'article_bottom', name: 'সংবাদ আর্টিকেলের নিচে', type: 'custom_code' },
    { key: 'footer_banner', name: 'ফুটার ব্যানার', type: 'custom_code' },
    { key: 'adsterra_social_bar', name: 'অ্যাডস্টেরা সোশ্যাল বার (Adsterra Social Bar)', type: 'custom_code' },
    { key: 'adsterra_popunder', name: 'অ্যাডস্টেরা পপআন্ডার (Adsterra Popunder)', type: 'custom_code' }
  ];

  for (const slot of adSlots) {
    db.run(`
      INSERT INTO ad_placements (slot_key, name, ad_type, is_active, device_target, custom_code)
      VALUES (?, ?, ?, 1, 'all', '')
    `, [slot.key, slot.name, slot.type]);
  }

  // 5. Seed Articles using generated images
  const sampleArticles = [
    {
      title: 'গড়াই নদীর নাব্য সংকট নিরসনে কুষ্টিয়ায় ড্রেজিং প্রকল্পের নতুন সমীক্ষা শুরু',
      sub_title: 'নদী রক্ষায় যৌথ টাস্কফোর্সের সমন্বিত উদ্যোগ ও স্থানীয় জনগণের দীর্ঘদিনের দাবি পূরণ হতে যাচ্ছে',
      slug: 'gorai-river-dredging-project-kushtia-survey-2026',
      excerpt: 'ঐতিহাসিক গড়াই নদীর পানিপ্রবাহ স্বাভাবিক রাখতে এবং কুষ্টিয়া-খোকসা অঞ্চলের কৃষিজমিতে সেচ সুবিধা বজায় রাখতে ৫০ কোটি টাকার নতুন ড্রেজিং ও রিভার ট্রেইনিং প্রকল্প হাতে নেওয়া হয়েছে।',
      content: `<p class="lead font-medium text-lg text-slate-800 mb-4"><strong>কুষ্টিয়া প্রতিনিধি:</strong> দক্ষিণ-পশ্চিমাঞ্চলের প্রাণপ্রবাহ ঐতিহাসিক গড়াই নদীর নাব্য ফিরিয়ে আনতে এবং বর্ষা পরবর্তী শুষ্ক মৌসুমে পানিপ্রবাহ অক্ষুণ্ণ রাখতে একটি সমন্বিত নতুন নদী সমীক্ষা শুরু করেছে পানি উন্নয়ন বোর্ড (পাউবো) ও নদী গবেষণা ইনস্টিটিউট।</p>
      <p class="mb-4">কুষ্টিয়া শহর সংলগ্ন ঐতিহাসিক গড়াই রেলসেতু থেকে শুরু করে খোকসা উপজেলা পর্যন্ত প্রায় ২৫ কিলোমিটার বিস্তৃত জলপথকে অগ্রাধিকার দিয়ে এই খনন পরিকল্পনা সাজানো হচ্ছে। সরেজমিনে দেখা গেছে, স্থানীয় মাঝি ও চাষিরা দীর্ঘদিন ধরে নদী ভরাট হয়ে চরে রূপ নেওয়ার আশঙ্কায় ছিলেন।</p>
      <h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">কৃষি ও জীববৈচিত্র্য রক্ষায় জরুরি ভূমিকা</h3>
      <p class="mb-4">কুষ্টিয়া জেলা কৃষি সম্প্রসারণ অধিদপ্তরের এক ঊর্ধ্বতন কর্মকর্তা জানান, গড়াই নদীর মিঠা পানির প্রবাহ যদি কুমার নদ ও সংলগ্ন খালগুলোতে ঠিকমতো প্রবাহিত না হয়, তবে শুষ্ক মৌসুমে ভূগর্ভস্থ পানির স্তর দ্রুত নেমে যায়। নতুন ড্রেজিংয়ের ফলে বোরো ধান চাষ ও সবজি উৎপাদনে ভূ-উপরিস্থ পানির ব্যবহার ৫০ শতাংশ বৃদ্ধি পাবে।</p>
      <p class="mb-4">এদিকে স্থানীয় নদী রক্ষা কমিটির নেতৃবৃন্দ ড্রেজিংয়ের বালু সুপরিকল্পিতভাবে অপসারণ এবং অবৈধ দখলদারদের বিরুদ্ধে কঠোর উচ্ছেদ অভিযানের দাবি জানিয়েছেন। জেলা প্রশাসনের পক্ষ থেকে জানানো হয়েছে, আগামী মাসের মধ্যেই মূল খনন কাজ শুরু করার লক্ষ্য নির্ধারণ করা হয়েছে।</p>`,
      featured_image: '/src/assets/images/kushtia_gorai_bridge_1791685269625.jpg',
      image_caption: 'কুষ্টিয়ার ঐতিহ্যবাহী গড়াই রেলসেতুর নিচে ভোরবেলায় নৌচলাচল ও নদী তীরের দৃশ্য।',
      image_credit: 'দৈনিক কুষ্টিয়া দিগন্ত / স্টাফ ফটো',
      category_id: 2, // কুষ্টিয়া
      tags: 'কুষ্টিয়া, গড়াই নদী, ড্রেজিং, উন্নয়ন, পানি উন্নয়ন বোর্ড',
      reporter_name: 'আরিফুল ইসলাম, কুষ্টিয়া',
      is_featured: 1,
      is_breaking: 1,
      views_count: 1420
    },
    {
      title: 'খোকসার ঐতিহ্যবাহী তাঁতশিল্পে আধুনিক প্রযুক্তির ছোঁয়া: রপ্তানি বাজারে নতুন সম্ভাবনা',
      sub_title: 'উপজেলার হাজারো তাঁতি পরিবারের কর্মসংস্থান ও অনলাইন প্ল্যাটফর্মে হস্তশিল্পের বিপণন জোরদার',
      slug: 'khoksa-traditional-handloom-weaving-modernization-2026',
      excerpt: 'কুষ্টিয়ার খোকসা উপজেলার গ্রামগুলোতে বংশপরম্পরায় চলে আসা তাঁতশিল্প আজ নিজস্ব ঐতিহ্য ধরে রেখে নতুন অর্থনৈতিক জোয়ার সৃষ্টি করছে। সুতা প্রণোদনা ও আধুনিক সুতি বস্ত্র ডিজাইনে আসছে বড় পরিবর্তন।',
      content: `<p class="lead font-medium text-lg text-slate-800 mb-4"><strong>খোকসা প্রতিনিধি:</strong> কুষ্টিয়ার খোকসা বললেই চোখে ভাসে খটখট শব্দে তাঁত বোনার চিরচেনা দৃশ্য। গড়াই নদীর তীরবর্তী এই ঐতিহ্যবাহী জনপদে বহু বছর ধরে নিখুঁত কারুকার্যের সুতি শাড়ি, লুঙ্গি ও গামছা তৈরি করে আসছেন স্থানীয় কারিগররা।</p>
      <p class="mb-4">সাম্প্রতিক সময়ে সরকারি ও বেসরকারি উদ্যোগে আধুনিক টেক্সটাইল ডিজাইন প্রশিক্ষণ এবং সরাসরি ই-কমার্স প্ল্যাটফর্মে পণ্য বিক্রির সুযোগ তৈরি হওয়ায় মধ্যস্বত্বভোগীদের দৌরাত্ম্য অনেকটাই কমেছে। স্থানীয় উদ্যোক্তারা জানান, উন্নত মানের প্রাকৃতিক রঙ এবং অর্গানিক কটন ব্যবহারের ফলে দেশি-বিদেশি ফ্যাশন হাউসগুলো এখন খোকসার তাঁতের কাপড়ে বিশেষ আগ্রহ দেখাচ্ছে।</p>
      <h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">তাঁতিদের দাবি সহজ শর্তে ঋণ ও কাঁচামাল নিশ্চিতকরণ</h3>
      <p class="mb-4">খোকসা বাজার তাঁত মালিক সমিতির এক প্রবীণ তাঁতি মো. আব্দুল বারী বলেন, "আমাদের হাতে বোনা কাপড়ের কদর কখনোই কমবে না। কিন্তু সুতার দাম স্থিতিশীল রাখা এবং সহজ শর্তে ক্ষুদ্র ঋণ পাওয়া গেলে আমাদের তরুণ প্রজন্ম এই পেশায় আরও উৎসাহিত হবে।"</p>`,
      featured_image: '/src/assets/images/khoksa_handloom_textile_1791685281623.jpg',
      image_caption: 'খোকসায় কাঠে তৈরি প্রাচীন হস্তচালিত তাঁতে সুতি বস্ত্র বুনছেন অভিজ্ঞ কারিগর।',
      image_credit: 'দৈনিক কুষ্টিয়া দিগন্ত / খোকসা ব্যুরো',
      category_id: 3, // খোকসা
      tags: 'খোকসা, তাঁত শিল্প, অর্থনীতি, কুষ্টিয়া, ঐতিহ্য',
      reporter_name: 'শেখ রিয়াজুল করিম, খোকসা',
      is_featured: 1,
      is_breaking: 0,
      views_count: 980
    },
    {
      title: 'শিলাইদহ কুঠিবাড়িতে আন্তর্জাতিক সাহিত্য সম্মেলনের প্রস্তুতি সম্পন্ন: আসছেন দেশ-বিদেশের গবেষকরা',
      sub_title: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের স্মৃতিবিজড়িত প্রাঙ্গণে তিন দিনব্যাপী আলোচনা ও সাংস্কৃতিক উৎসব',
      slug: 'shilaidaha-kuthibari-international-literature-conference-kushtia',
      excerpt: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের স্মৃতিধন্য শিলাইদহ কুঠিবাড়িতে বসছে আন্তর্জাতিক রবীন্দ্র গবেষক ও সাহিত্য সম্মেলন। পদ্মাবোটের স্মৃতি ও গ্রামীণ সাহিত্য ভাবনার ওপর বিশেষ প্রদর্শনী আয়োজন।',
      content: `<p class="lead font-medium text-lg text-slate-800 mb-4"><strong>কুষ্টিয়া সংস্কৃতি ডেস্ক:</strong> বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের সাহিত্য সাধনার অমর লীলাভূমি কুষ্টিয়ার কুমারখালী উপজেলার শিলাইদহ কুঠিবাড়ি চত্বরে আগামী সপ্তাহে শুরু হতে যাচ্ছে আন্তর্জাতিক সাহিত্য ও রবীন্দ্র সম্মেলন।</p>
      <p class="mb-4">কুষ্টিয়া জেলা প্রশাসন ও প্রত্নতত্ত্ব অধিদপ্তরের যৌথ আয়োজনে এই সম্মেলনে ভারত, যুক্তরাজ্য, জাপানসহ বিভিন্ন দেশের খ্যাতনামা সাহিত্যিক ও রবীন্দ্র গবেষকরা অংশ নেবেন। কুঠিবাড়ির মনোরম আম্রকুঞ্জ ও বকুলতলায় আয়োজিত সেমিনারে রবীন্দ্রনাথের ছিন্নপত্রাবলী ও গ্রামবাংলার সমাজদর্শন নিয়ে মৌলিক গবেষণাপত্র উপস্থাপিত হবে।</p>`,
      featured_image: '/src/assets/images/shilaidaha_kuthibari_1791685291373.jpg',
      image_caption: 'কুষ্টিয়ার কুমারখালীর পদ্মাতীরবর্তী ঐতিহাসিক লাল ইটের দ্বিতল শিলাইদহ কুঠিবাড়ি।',
      image_credit: 'দৈনিক কুষ্টিয়া দিগন্ত / সংস্কৃতি বিভাগ',
      category_id: 15, // ফিচার
      tags: 'কুষ্টিয়া, শিলাইদহ কুঠিবাড়ি, রবীন্দ্রনাথ ঠাকুর, সাহিত্য, সংস্কৃতি',
      reporter_name: 'তানজিলা নাসরিন, কুষ্টিয়া',
      is_featured: 1,
      is_breaking: 0,
      views_count: 1150
    },
    {
      title: 'সংসদে জাতীয় বাজেট বাস্তবায়ন ও উন্নয়ন প্রকল্প তদারকিতে কঠোর নির্দেশ প্রধানমন্ত্রীর',
      sub_title: 'প্রকল্প ব্যয়ের স্বচ্ছতা নিশ্চিত করতে জেলা পর্যায়ে মনিটরিং সেল গঠনের নির্দেশনা',
      slug: 'national-parliament-budget-monitoring-directives-bangladesh',
      excerpt: 'জাতীয় অর্থনৈতিক পরিষদের বৈঠকে গৃহীত সিদ্ধান্ত অনুসারে দেশের সব উন্নয়ন প্রকল্পের সময়মতো বাস্তবায়ন ও অর্থ অপচয় রোধে কঠোর নজরদারির নির্দেশ দেওয়া হয়েছে।',
      content: `<p class="lead font-medium text-lg text-slate-800 mb-4"><strong>জাতীয় বার্তা ডেস্ক:</strong> জাতীয় সংসদ ভবনে অনুষ্ঠিত উচ্চপর্যায়ের পর্যালোচনা সভায় চলমান মেগা প্রকল্প ও জেলাভিত্তিক অবকাঠামো উন্নয়ন প্রকল্পের অগ্রগতি খতিয়ে দেখা হয়েছে। সভায় প্রকল্প পরিচালকদের কর্মস্থলে সার্বক্ষণিক উপস্থিতি এবং ব্যয়ের স্বচ্ছতা নিশ্চিতে জোর তাগিদ দেওয়া হয়।</p>`,
      featured_image: '/src/assets/images/national_parliament_dhaka_1791685303548.jpg',
      image_caption: 'রাজধানীর শেরেবাংলা নগরে লেকের শান্ত জলে প্রতিবিম্বিত জাতীয় সংসদ ভবন।',
      image_credit: 'দৈনিক কুষ্টিয়া দিগন্ত / পিআইডি',
      category_id: 1, // জাতীয়
      tags: 'জাতীয়, সংসদ, বাজেট, উন্নয়ন প্রকল্প, বাংলাদেশ',
      reporter_name: 'বিশেষ সংসদ প্রতিনিধি, ঢাকা',
      is_featured: 0,
      is_breaking: 0,
      views_count: 870
    },
    {
      title: 'জাতীয় ক্রিকেট চ্যাম্পিয়নশিপে রোমাঞ্চকর জয়: খুলনার দুর্দান্ত পারফরম্যান্সে দর্শকদের উচ্ছ্বাস',
      sub_title: 'শেষ ওভারের টানটান উত্তেজনায় ৩ উইকেটে জয় নিশ্চিত করল বিভাগীয় একাদশ',
      slug: 'bangladesh-cricket-national-championship-thrilling-victory',
      excerpt: 'বিভাগীয় ক্রিকেট টুর্নামেন্টের উত্তেজনাপূর্ণ ম্যাচে অলরাউন্ড পারফরম্যান্সে বাজিমাত করেছে তরুণ ক্রিকেটাররা। স্টেডিয়ামজুড়ে লাখো দর্শকের গগণবিদারী উল্লাস।',
      content: `<p class="lead font-medium text-lg text-slate-800 mb-4"><strong>খেলাধুলা ডেস্ক:</strong> তীব্র প্রতিদ্বন্দ্বিতাপূর্ণ ম্যাচে শেষ বলের নাটকে জয় ছিনিয়ে নিয়েছে দল। ফিল্ডারদের চোখধাঁধানো ক্যাচ এবং বোলারদের নিয়ন্ত্রিত বোলিংয়ে প্রতিপক্ষকে অল্প রানেই আটকে দেওয়া সম্ভব হয়।</p>`,
      featured_image: '/src/assets/images/bangladesh_cricket_match_1791685313696.jpg',
      image_caption: 'উইকেট পতনের পর উল্লাসে ভাসছেন ক্রিকেটাররা।',
      image_credit: 'দৈনিক কুষ্টিয়া দিগন্ত / স্পোর্টস ডেস্ক',
      category_id: 9, // খেলাধুলা
      tags: 'খেলাধুলা, ক্রিকেট, জাতীয় দল, টুর্নামেন্ট',
      reporter_name: 'স্পোর্টস ডেস্ক, দৈনিক কুষ্টিয়া দিগন্ত',
      is_featured: 0,
      is_breaking: 0,
      views_count: 1650
    }
  ];

  for (const art of sampleArticles) {
    db.run(`
      INSERT INTO articles (
        title, sub_title, slug, excerpt, content, featured_image,
        image_caption, image_credit, category_id, tags, author_id,
        reporter_name, status, is_featured, is_breaking, views_count,
        published_at, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 1,
        ?, 'published', ?, ?, ?,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `, [
      art.title, art.sub_title, art.slug, art.excerpt, art.content, art.featured_image,
      art.image_caption, art.image_credit, art.category_id, art.tags,
      art.reporter_name, art.is_featured, art.is_breaking, art.views_count
    ]);
  }

  // 6. Breaking news items
  db.run(`
    INSERT INTO breaking_news (title, article_id, is_active, priority)
    VALUES 
    ('গড়াই নদীর ড্রেজিং প্রকল্প অনুমোদন: কুষ্টিয়া ও খোকসায় পানি সংকট নিরসনে নতুন আশার আলো', 1, 1, 1),
    ('শিলাইদহ কুঠিবাড়িতে আগামী সপ্তাহে শুরু হচ্ছে তিন দিনব্যাপী আন্তর্জাতিক সাহিত্য সম্মেলন', 3, 1, 2),
    ('খোকসা তাঁতশিল্পের আধুনিকায়নে সরকারি বিশেষ প্রণোদনা প্যাকেজ ঘোষণা', 2, 1, 3)
  `);
}
