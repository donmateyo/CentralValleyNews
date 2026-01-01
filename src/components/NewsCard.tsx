import { useState } from 'react';
import type { Article } from '../types';

interface NewsCardProps {
  article: Article;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHrs < 24) return `${diffHrs}h`;
  return `${diffDays}d`;
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function getPlaceholderImage(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const seed = Math.abs(hash);
  return `https://picsum.photos/seed/${seed}/400/250`;
}

export function NewsCard({ article }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const timeString = formatTimeAgo(article.pubDate);
  const cleanTitle = decodeHtmlEntities(article.title);

  const imageUrl: string = (!imageError && article.imageUrl) 
    ? article.imageUrl 
    : getPlaceholderImage(article.title);

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col paper-card rounded-lg overflow-hidden hover:shadow-xl transition active:scale-[0.98] group h-full"
    >
      {/* Image */}
      <div className="h-28 w-full overflow-hidden bg-[--bg-secondary] relative">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
          loading="lazy"
          onError={() => {
            if (!imageError) {
              setImageError(true);
            }
          }}
        />

        {/* Time Badge */}
        <div className="absolute top-1.5 left-1.5 bg-[--bg-header] px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wide shadow-sm">
          {timeString}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <span className="text-[9px] font-bold uppercase tracking-wider mb-1 text-[--accent]">
          {article.sourceName}
        </span>
        <h3 className="text-xs font-semibold text-[--text-primary] leading-snug line-clamp-3 group-hover:text-[--accent]">
          {cleanTitle}
        </h3>
      </div>
    </a>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="paper-card rounded-lg overflow-hidden h-full animate-pulse">
      <div className="h-28 w-full bg-[--bg-secondary]" />
      <div className="p-3 space-y-2">
        <div className="h-2 w-16 bg-[--bg-secondary] rounded" />
        <div className="h-3 w-full bg-[--bg-secondary] rounded" />
        <div className="h-3 w-3/4 bg-[--bg-secondary] rounded" />
      </div>
    </div>
  );
}