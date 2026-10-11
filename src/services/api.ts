import { Article, Category, BreakingNewsItem, AdPlacement, SiteSettings, User, CommentItem, RevisionItem, MediaAsset, AuditLog, SocialShare } from '../types/news';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('kushtia_diganta_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('kushtia_diganta_token', token);
  } else {
    localStorage.removeItem('kushtia_diganta_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'অনুরোধ সম্পন্ন করা যায়নি';
    try {
      const errData = await res.json();
      errorMsg = errData.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Public
  getBootstrap: () => request<{
    settings: SiteSettings;
    categories: Category[];
    breakingNews: BreakingNewsItem[];
    ads: Record<string, AdPlacement>;
  }>('/public/bootstrap'),

  getArticles: (params?: {
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    breaking?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    if (params?.breaking) query.set('breaking', 'true');
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return request<{
      articles: Article[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/public/articles?${query.toString()}`);
  },

  getArticleBySlug: (slug: string) =>
    request<{
      article: Article;
      related: Article[];
      comments: CommentItem[];
    }>(`/public/articles/${slug}`),

  trackView: (id: number) =>
    request<{ success: boolean }>(`/public/articles/${id}/view`, { method: 'POST' }),

  getTrending: () => request<Article[]>('/public/trending'),

  postComment: (articleId: number, data: { author_name: string; author_email?: string; comment_text: string }) =>
    request<{ success: boolean; message: string }>(`/public/articles/${articleId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Auth
  login: async (email: string, password: string) => {
    const res = await request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  getCurrentUser: () => request<{ user: User }>('/auth/me'),

  // Admin
  getAdminArticles: (status?: string) =>
    request<Article[]>(`/admin/articles${status ? `?status=${status}` : ''}`),

  getAdminArticleById: (id: number) =>
    request<{ article: Article; revisions: RevisionItem[] }>(`/admin/articles/${id}`),

  createArticle: (data: Partial<Article>) =>
    request<{ success: boolean; articleId: number; slug: string }>('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateArticle: (id: number, data: Partial<Article> & { revision_note?: string }) =>
    request<{ success: boolean; message: string }>(`/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteArticle: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/articles/${id}`, {
      method: 'DELETE',
    }),

  restoreRevision: (articleId: number, revisionId: number) =>
    request<{ success: boolean; message: string }>(`/admin/articles/${articleId}/restore-revision`, {
      method: 'POST',
      body: JSON.stringify({ revision_id: revisionId }),
    }),

  // Categories
  getAdminCategories: () => request<Category[]>('/admin/categories'),
  createCategory: (data: Partial<Category>) =>
    request<{ success: boolean; message: string }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: number, data: Partial<Category>) =>
    request<{ success: boolean; message: string }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number, reassignTo?: number) =>
    request<{ success: boolean; message: string }>(`/admin/categories/${id}${reassignTo ? `?reassignTo=${reassignTo}` : ''}`, {
      method: 'DELETE',
    }),

  // Breaking News
  getAdminBreaking: () => request<BreakingNewsItem[]>('/admin/breaking'),
  createBreaking: (data: Partial<BreakingNewsItem>) =>
    request<{ success: boolean; message: string }>('/admin/breaking', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBreaking: (id: number, data: Partial<BreakingNewsItem>) =>
    request<{ success: boolean; message: string }>(`/admin/breaking/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBreaking: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/breaking/${id}`, {
      method: 'DELETE',
    }),

  // Ads & Adsterra
  getAdminAds: () => request<AdPlacement[]>('/admin/ads'),
  updateAdSlot: (key: string, data: Partial<AdPlacement>) =>
    request<{ success: boolean; message: string }>(`/admin/ads/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Settings
  getAdminSettings: () => request<SiteSettings>('/admin/settings'),
  updateAdminSettings: (data: Record<string, string>) =>
    request<{ success: boolean; message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Media
  getMediaAssets: () => request<MediaAsset[]>('/admin/media'),
  uploadMedia: (data: {
    fileData: string;
    fileName: string;
    mimeType: string;
    altText?: string;
    caption?: string;
    credit?: string;
  }) =>
    request<{ success: boolean; url: string; filename: string }>('/admin/media/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteMedia: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/media/${id}`, {
      method: 'DELETE',
    }),

  // Social Publishing
  publishFacebook: (articleId: number) =>
    request<{ success: boolean; share: SocialShare }>('/admin/social/publish-facebook', {
      method: 'POST',
      body: JSON.stringify({ article_id: articleId }),
    }),
  getSocialShares: () => request<SocialShare[]>('/admin/social/shares'),

  // Analytics
  getAnalytics: () =>
    request<{
      metrics: {
        totalPublished: number;
        totalDrafts: number;
        totalPending: number;
        totalViews: number;
        totalCategories: number;
      };
      topArticles: Array<{ id: number; title: string; slug: string; views_count: number; published_at: string }>;
      recentLogs: AuditLog[];
    }>('/admin/analytics'),
};
