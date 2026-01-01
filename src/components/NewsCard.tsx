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

export function NewsCard({ article }: NewsCardProps) {
  const timeString = formatTimeAgo(article.pubDate);
  const cleanTitle = decodeHtmlEntities(article.title);

  // Generate gradient color based on title
  const hue = (article.title.length * 7) % 360;

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col glass-panel rounded-xl overflow-hidden hover:bg-slate-800 transition active:scale-[0.98] group h-full"
    >
      {/* Image */}
      <div className="h-28 w-full overflow-hidden bg-slate-800 relative">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`${article.imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 40%, 20%), hsl(${hue}, 40%, 10%))`
          }}
        >
          <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z"/>
          </svg>
        </div>

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
