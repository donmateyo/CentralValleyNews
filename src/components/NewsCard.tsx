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

// Generate a consistent gradient based on source name
function getGradientForSource(sourceName: string): string {
  const gradients: Record<string, string> = {
    'ABC30': 'from-blue-900 to-blue-700',
    'KSEE24': 'from-indigo-900 to-indigo-700',
    'KMPH': 'from-orange-900 to-orange-700',
    'GV Wire': 'from-emerald-900 to-emerald-700',
    'KVPR': 'from-purple-900 to-purple-700'
  };
  return gradients[sourceName] || 'from-slate-800 to-slate-700';
}

// Newspaper icon SVG component
function NewspaperIcon() {
  return (
    <svg
      className="w-10 h-10 text-white/20"
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Zm-24-120a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h64A8,8,0,0,1,192,80Zm0,32a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h64A8,8,0,0,1,192,112Zm0,32a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h64A8,8,0,0,1,192,144Zm0,32a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h64A8,8,0,0,1,192,176Z"/>
    </svg>
  );
}

export function NewsCard({ article }: NewsCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timeString = formatTimeAgo(article.pubDate);
  const cleanTitle = decodeHtmlEntities(article.title);

  const hasValidImage = article.imageUrl && !imageError;
  const gradientClass = getGradientForSource(article.sourceName);

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col glass-panel rounded-xl overflow-hidden hover:bg-slate-800 transition active:scale-[0.98] group h-full"
    >
      {/* Image Container */}
      <div className="h-28 w-full overflow-hidden relative">
        {/* Gradient Placeholder - always shown underneath */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <NewspaperIcon />
        </div>

        {/* Actual Image - shown on top when available and loaded */}
        {hasValidImage && (
          <img
            src={article.imageUrl!}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Time Badge */}
        <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wide border border-white/10 shadow-sm z-10">
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