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

function getGradientForSource(sourceName: string): string {
  const gradients: Record<string, string> = {
    'ABC30': 'vp-gradient--blue',
    'KSEE24': 'vp-gradient--indigo',
    'KMPH': 'vp-gradient--amber',
    'GV Wire': 'vp-gradient--emerald',
    'KVPR': 'vp-gradient--violet'
  };
  return gradients[sourceName] || 'vp-gradient--slate';
}

export function NewsCard({ article }: NewsCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timeString = formatTimeAgo(article.pubDate);
  const cleanTitle = decodeHtmlEntities(article.title);

  const hasValidImage = article.imageUrl && !imageError;
  const gradientClass = getGradientForSource(article.sourceName);

  return (
    <article className="vp-card vp-card--news">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="vp-card__link"
        aria-label={cleanTitle}
      >
        <div className={`vp-card__media ${gradientClass}`}>
          <div className="vp-card__media-inner" aria-hidden="true" />
          {hasValidImage && (
            <img
              src={article.imageUrl!}
              alt=""
              className={`vp-card__img ${imageLoaded ? 'is-visible' : ''}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          <span className="vp-card__time">{timeString}</span>
        </div>

        <div className="vp-card__content">
          <span className={`vp-source ${article.sourceColor}`}>{article.sourceName}</span>
          <h3 className="vp-card__title">{cleanTitle}</h3>
        </div>
      </a>
    </article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="vp-card vp-card--skeleton" aria-hidden="true">
      <div className="vp-skeleton vp-skeleton--media" />
      <div className="vp-card__content">
        <div className="vp-skeleton vp-skeleton--line" />
        <div className="vp-skeleton vp-skeleton--line-lg" />
        <div className="vp-skeleton vp-skeleton--line-md" />
      </div>
    </div>
  );
}