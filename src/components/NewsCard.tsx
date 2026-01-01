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

// Generate a consistent placeholder image URL based on article content
function getPlaceholderImage(article: Article): string {
  // Create a hash from the title for consistent random image
  let hash = 0;
  for (let i = 0; i < article.title.length; i++) {
    const char = article.title.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const seed = Math.abs(hash);

  // Use picsum.photos with a seed for consistent images
  return `https://picsum.photos/seed/${seed}/400/250`;
}

export function NewsCard({ article }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const timeString = formatTimeAgo(article.pubDate);
  const cleanTitle = decodeHtmlEntities(article.title);

  // Determine which image to show
  const hasOriginalImage = article.imageUrl && !imageError;
  const imageUrl = hasOriginalImage ? article.imageUrl : getPlaceholderImage(article);

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col glass-panel rounded-xl overflow-hidden hover:bg-slate-800 transition active:scale-[0.98] group h-full"
    >
      {/* Image */}
      <div className="h-28 w-full overflow-hidden bg-slate-800 relative">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
          loading="lazy"
          onError={() => {
            if (!imageError) {
              setImageError(true);
            }
          }}
        />

        {/* Time Badge */}
        <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wide border border-white/10 shadow-sm">
          {timeString}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <span className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${article.sourceColor}`}>
          {article.sourceName}
        </span>
        <h3 className="text-xs font-medium text-slate-200 leading-snug line-clamp-3 group-hover:text-white">
          {cleanTitle}
        </h3>
      </div>
    </a>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full animate-pulse">
      <div className="h-28 w-full bg-slate-700/50" />
      <div className="p-3 space-y-2">
        <div className="h-2 w-16 bg-slate-700/50 rounded" />
        <div className="h-3 w-full bg-slate-700/50 rounded" />
        <div className="h-3 w-3/4 bg-slate-700/50 rounded" />
      </div>
    </div>
  );
}