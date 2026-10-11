import React, { useState } from 'react';
import { Article } from '../types/news';
import { formatTimeAgoBengali, toBengaliNumber } from '../utils/bengali';
import { Newspaper, Eye } from 'lucide-react';

interface NewsCardProps {
  article: Article;
  variant?: 'lead' | 'featured' | 'standard' | 'compact' | 'minimal';
  showCategory?: boolean;
  onNavigate?: (slug: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  variant = 'standard',
  showCategory = true,
  onNavigate,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(article.slug);
    } else {
      window.location.hash = `#/article/${article.slug}`;
    }
  };

  const imageFallback = (
    <div className="w-full h-full min-h-[140px] bg-slate-100 flex flex-col items-center justify-center text-slate-500 p-4">
      <Newspaper className="w-8 h-8 text-slate-500 mb-1" />
      <span className="text-[11px] font-sans">দৈনিক কুষ্টিয়া দিগন্ত</span>
    </div>
  );

  // Variant: LEAD STORY
  if (variant === 'lead') {
    return (
      <article className="group relative flex flex-col lg:flex-row gap-6 bg-white border border-slate-200/90 rounded-lg p-5 lg:p-6 shadow-xs hover:border-slate-300 transition-colors">
        {/* Lead Image */}
        <div className="w-full lg:w-3/5 overflow-hidden rounded bg-slate-100 relative aspect-16/10">
          {article.featured_image && !imageError ? (
            <img
              src={article.featured_image}
              alt={article.title}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            />
          ) : (
            imageFallback
          )}
          {article.image_caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 text-white text-xs font-bangla">
              <span className="line-clamp-1">{article.image_caption}</span>
            </div>
          )}
        </div>

        {/* Lead Content */}
        <div className="w-full lg:w-2/5 flex flex-col justify-between">
          <div>
            {/* Metadata (Zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-bangla">
              {showCategory && article.category_name_bn && (
                <span className="text-red-700 font-semibold">{article.category_name_bn}</span>
              )}
              {showCategory && article.category_name_bn && <span aria-hidden="true">·</span>}
              <span>{formatTimeAgoBengali(article.published_at || article.created_at)}</span>
              {article.views_count > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {toBengaliNumber(article.views_count)}
                  </span>
                </>
              )}
            </div>

            {/* Headline */}
            <h2 className="text-2xl lg:text-3xl font-headline font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors balance">
              <a href={`#/article/${article.slug}`} onClick={handleClick}>
                {article.title}
              </a>
            </h2>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-3 text-slate-600 text-sm lg:text-base leading-relaxed line-clamp-3 font-body-bn">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Reporter byline */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">{article.reporter_name}</span>
            <span className="text-blue-800 font-medium group-hover:underline">বিস্তারিত পড়ুন →</span>
          </div>
        </div>
      </article>
    );
  }

  // Variant: FEATURED (Secondary cards)
  if (variant === 'featured') {
    return (
      <article className="group flex flex-col bg-white border border-slate-200/90 rounded-lg overflow-hidden p-4 shadow-xs hover:border-slate-300 transition-colors">
        <div className="relative aspect-16/10 overflow-hidden rounded bg-slate-100 mb-3">
          {article.featured_image && !imageError ? (
            <img
              src={article.featured_image}
              alt={article.title}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            imageFallback
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bangla">
          {showCategory && article.category_name_bn && (
            <span className="text-red-700 font-semibold">{article.category_name_bn}</span>
          )}
          {showCategory && article.category_name_bn && <span aria-hidden="true">·</span>}
          <span>{formatTimeAgoBengali(article.published_at || article.created_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-headline font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
          <a href={`#/article/${article.slug}`} onClick={handleClick}>
            {article.title}
          </a>
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-2 text-slate-600 text-xs leading-relaxed line-clamp-2 font-body-bn">
            {article.excerpt}
          </p>
        )}

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{article.reporter_name}</span>
        </div>
      </article>
    );
  }

  // Variant: COMPACT (Sidebar / Most-read list)
  if (variant === 'compact') {
    return (
      <article className="group flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0">
        <div className="w-20 h-16 shrink-0 rounded overflow-hidden bg-slate-100">
          {article.featured_image && !imageError ? (
            <img
              src={article.featured_image}
              alt={article.title}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500">
              <Newspaper className="w-4 h-4 text-slate-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 font-bangla">
            {showCategory && article.category_name_bn && (
              <span className="text-red-700 font-medium">{article.category_name_bn}</span>
            )}
            {showCategory && article.category_name_bn && <span aria-hidden="true">·</span>}
            <span>{formatTimeAgoBengali(article.published_at || article.created_at)}</span>
          </div>

          <h4 className="text-sm font-headline font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors">
            <a href={`#/article/${article.slug}`} onClick={handleClick}>
              {article.title}
            </a>
          </h4>
        </div>
      </article>
    );
  }

  // Variant: MINIMAL (Numbered trend or headline only)
  if (variant === 'minimal') {
    return (
      <article className="group py-2.5 border-b border-slate-100 last:border-b-0">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1 font-bangla">
          {article.category_name_bn && (
            <span className="text-red-700 font-medium">{article.category_name_bn}</span>
          )}
          <span aria-hidden="true">·</span>
          <span>{formatTimeAgoBengali(article.published_at || article.created_at)}</span>
        </div>
        <h4 className="text-sm font-headline font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors">
          <a href={`#/article/${article.slug}`} onClick={handleClick}>
            {article.title}
          </a>
        </h4>
      </article>
    );
  }

  // Variant: STANDARD (Default grid card)
  return (
    <article className="group flex flex-col bg-white border border-slate-200/80 rounded-lg overflow-hidden p-3.5 shadow-xs hover:border-slate-300 transition-colors">
      <div className="relative aspect-16/10 overflow-hidden rounded bg-slate-100 mb-2.5">
        {article.featured_image && !imageError ? (
          <img
            src={article.featured_image}
            alt={article.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          imageFallback
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-bangla">
        {showCategory && article.category_name_bn && (
          <span className="text-red-700 font-semibold">{article.category_name_bn}</span>
        )}
        {showCategory && article.category_name_bn && <span aria-hidden="true">·</span>}
        <span>{formatTimeAgoBengali(article.published_at || article.created_at)}</span>
      </div>

      <h3 className="text-base font-headline font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors">
        <a href={`#/article/${article.slug}`} onClick={handleClick}>
          {article.title}
        </a>
      </h3>

      {article.excerpt && (
        <p className="mt-2 text-slate-600 text-xs leading-relaxed line-clamp-2 font-body-bn">
          {article.excerpt}
        </p>
      )}

      <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate">{article.reporter_name}</span>
        {article.views_count > 0 && (
          <span className="flex items-center gap-1 shrink-0">
            <Eye className="w-3 h-3" /> {toBengaliNumber(article.views_count)}
          </span>
        )}
      </div>
    </article>
  );
};
