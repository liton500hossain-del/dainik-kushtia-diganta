export interface Category {
  id: number;
  name_bn: string;
  name_en: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: number;
  in_navbar: number;
  article_count?: number;
}

export interface Article {
  id: number;
  title: string;
  sub_title?: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  image_caption?: string;
  image_credit?: string;
  category_id: number;
  category_name_bn?: string;
  category_slug?: string;
  tags?: string;
  author_id?: number;
  author_full_name?: string;
  author_designation?: string;
  author_avatar?: string;
  reporter_name: string;
  status: 'draft' | 'pending_review' | 'scheduled' | 'published' | 'archived';
  is_featured: number;
  is_breaking: number;
  is_pinned?: number;
  views_count: number;
  seo_title?: string;
  seo_description?: string;
  correction_notice?: string;
  published_at?: string;
  updated_at?: string;
  created_at: string;
}

export interface BreakingNewsItem {
  id: number;
  title: string;
  article_id?: number;
  article_slug?: string;
  external_url?: string;
  priority: number;
  is_active: number;
}

export interface AdPlacement {
  id?: number;
  slot_key: string;
  name: string;
  ad_type: 'banner' | 'custom_code';
  banner_image?: string;
  target_url?: string;
  custom_code?: string;
  is_active: number;
  device_target: 'all' | 'desktop' | 'mobile';
  start_date?: string;
  end_date?: string;
}

export interface SiteSettings {
  site_name_bn?: string;
  site_name_en?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  header_ad_enabled?: string;
  header_ad_title?: string;
  header_ad_image?: string;
  header_ad_link?: string;
  facebook_page_id?: string;
  facebook_access_token?: string;
  meta_app_id?: string;
  meta_app_secret?: string;
  auto_facebook_publish?: string;
  weather_widget_enabled?: string;
  editor_name?: string;
  executive_editor?: string;
  office_address?: string;
  khoksa_office?: string;
  contact_phone?: string;
  contact_email?: string;
  facebook_url?: string;
  youtube_url?: string;
  x_url?: string;
  [key: string]: string | undefined;
}

export interface User {
  id: number;
  email: string;
  role: 'super_admin' | 'editor' | 'reporter';
  fullName: string;
  designation?: string;
  avatarUrl?: string;
}

export interface CommentItem {
  id: number;
  author_name: string;
  comment_text: string;
  created_at: string;
}

export interface RevisionItem {
  id: number;
  title: string;
  note?: string;
  created_at: string;
  editor_name: string;
}

export interface MediaAsset {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  alt_text?: string;
  caption?: string;
  credit?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export interface SocialShare {
  id: number;
  article_id: number;
  article_title: string;
  article_slug: string;
  platform: string;
  status: 'published' | 'failed' | 'pending';
  post_id?: string;
  error_message?: string;
  attempts: number;
  created_at: string;
}
