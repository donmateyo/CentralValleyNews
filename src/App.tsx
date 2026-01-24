import { useState, useCallback, useMemo, useEffect, useId } from 'react';
import { Header } from './components/Header';
import { WeatherCard } from './components/WeatherCard';
import { NewsCard, NewsCardSkeleton } from './components/NewsCard';
import { TabNav } from './components/TabNav';
import { Toast, showToast } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { useNews } from './hooks/useNews';
import { FRESNO_KEYWORDS, TULARE_KEYWORDS } from './config';
import type { Article } from './types';

type CategoryId =
  | 'all'
  | 'public-safety'
  | 'weather'
  | 'traffic'
  | 'education'
  | 'business'
  | 'sports'
  | 'politics'
  | 'community';

const CATEGORY_DEFS: Array<{
  id: CategoryId;
  label: string;
  match: (text: string) => boolean;
}> = [
  { id: 'all', label: 'All', match: () => true },
  {
    id: 'public-safety',
    label: 'Public Safety',
    match: (t) =>
      hasAny(t, [
        'police', 'sheriff', 'crime', 'shooting', 'homicide', 'arrest',
        'fire', 'wildfire', 'calfire', 'evacuation', 'chp', 'rescue'
      ])
  },
  {
    id: 'weather',
    label: 'Weather',
    match: (t) =>
      hasAny(t, [
        'weather', 'storm', 'rain', 'heat', 'forecast', 'wind', 'snow',
        'air quality', 'aqi', 'smoke', 'fog'
      ])
  },
  {
    id: 'traffic',
    label: 'Traffic',
    match: (t) =>
      hasAny(t, [
        'traffic', 'collision', 'crash', 'highway', 'freeway', 'road',
        'lane', 'closure', 'detour', '99', '41', '168'
      ])
  },
  {
    id: 'education',
    label: 'Education',
    match: (t) =>
      hasAny(t, [
        'school', 'district', 'college', 'university', 'campus',
        'students', 'teacher', 'education', 'fresno state'
      ])
  },
  {
    id: 'business',
    label: 'Business',
    match: (t) =>
      hasAny(t, [
        'business', 'economy', 'jobs', 'market', 'company',
        'startup', 'industry', 'investment'
      ])
  },
  {
    id: 'sports',
    label: 'Sports',
    match: (t) =>
      hasAny(t, [
        'sports', 'football', 'baseball', 'basketball', 'soccer',
        'game', 'tournament', 'score'
      ])
  },
  {
    id: 'politics',
    label: 'Politics',
    match: (t) =>
      hasAny(t, [
        'city council', 'supervisor', 'election', 'policy', 'governor',
        'mayor', 'legislation', 'vote'
      ])
  },
  {
    id: 'community',
    label: 'Community',
    match: (t) =>
      hasAny(t, [
        'community', 'festival', 'event', 'nonprofit', 'health',
        'public', 'housing', 'arts', 'culture'
      ])
  }
];

const REFRESH_GRADIENTS = [
  'vp-gradient--blue',
  'vp-gradient--indigo',
  'vp-gradient--amber',
  'vp-gradient--emerald',
  'vp-gradient--violet',
  'vp-gradient--slate'
];

function normalizeText(article: Article): string {
  return `${article.title} ${article.description}`.toLowerCase();
}

function hasAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

function isBreaking(pubDate: Date): boolean {
  const diffMs = Date.now() - pubDate.getTime();
  return diffMs < 2 * 60 * 60 * 1000;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

export default function App() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [category, setCategory] = useState<CategoryId>('all');
  const [progress, setProgress] = useState(0);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const mobileWeatherId = useId();

  const {
    articles,
    currentTab,
    setCurrentTab,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh: refreshNews
  } = useNews();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshNews();
      showToast('Feed updated', 'success');
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshNews]);

  const categoryDef = CATEGORY_DEFS.find((c) => c.id === category) || CATEGORY_DEFS[0];

  const filteredArticles = useMemo(() => {
    const list = articles;
    if (categoryDef.id === 'all') return list;
    return list.filter((a) => categoryDef.match(normalizeText(a)));
  }, [articles, categoryDef]);

  const featured = filteredArticles[0] || null;
  const secondary = filteredArticles.slice(1);
  const isHeroLoading = loading && filteredArticles.length === 0;

  const localityKeywords = useMemo(
    () => [...FRESNO_KEYWORDS, ...TULARE_KEYWORDS],
    []
  );

  const localitySummary = useMemo(() => {
    const words = localityKeywords.slice(0, 6).join(', ');
    return `Focused on ${words} and the Central Valley.`;
  }, [localityKeywords]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const docHeight = doc.scrollHeight - doc.clientHeight;
        const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
        setProgress(ratio);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="vp-shell">
      <style>{`
        .vp-mobile-weather { margin-top: 1.5rem; }
        .vp-disclosure { padding: 1rem; }
        .vp-disclosure__button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          text-align: left;
          background: transparent;
          border: 0;
          padding: 0;
          cursor: pointer;
        }
        .vp-disclosure__button:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
          border-radius: 0.5rem;
        }
        .vp-disclosure__icon {
          display: inline-flex;
          transition: transform 200ms ease;
        }
        .vp-disclosure__icon.is-open { transform: rotate(180deg); }

        .vp-disclosure__panel {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 250ms ease, opacity 200ms ease;
        }
        .vp-disclosure__panel.is-open {
          max-height: 1200px;
          opacity: 1;
        }
        .vp-disclosure__panel-inner { margin-top: 1rem; }

        .vp-refreshing {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin: 1rem 0 0.5rem;
          color: inherit;
          opacity: 0.9;
          animation: vp-fade 1.4s ease-in-out infinite;
        }
        .vp-refreshing__spinner {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 9999px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          animation: vp-spin 0.9s linear infinite;
        }
        .vp-refresh-row {
          margin-top: 1rem;
          opacity: 0.8;
        }
        .vp-refresh-card {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
        }
        .vp-refresh-tone__overlay {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0.18;
          pointer-events: none;
        }
        .vp-refresh-row .vp-card--skeleton {
          position: relative;
          overflow: hidden;
          z-index: 1;
          background: transparent;
        }
        .vp-refresh-row .vp-card--skeleton::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0) 100%
          );
          animation: vp-shimmer 1.6s ease-in-out infinite;
        }

        @keyframes vp-spin { to { transform: rotate(360deg); } }
        @keyframes vp-fade {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes vp-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (min-width: 1024px) {
          .vp-mobile-weather { display: none; }
        }
        @media (max-width: 1023px) {
          .vp-desktop-weather { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vp-disclosure__icon,
          .vp-disclosure__panel,
          .vp-refreshing,
          .vp-refreshing__spinner,
          .vp-refresh-row .vp-card--skeleton::after { transition: none; animation: none; }
        }
      `}</style>

      <div
        className="vp-progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${progress})` }}
      />
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <main className="vp-main" id="top">
        <div className="vp-container">
          <div className="vp-layout">
            <div className="vp-primary">
              <section className="vp-hero" aria-labelledby="featured-heading">
                <article className="vp-hero__card" aria-busy={isHeroLoading}>
                  <div className="vp-hero__media" aria-hidden="true">
                    {isHeroLoading ? (
                      <div className="vp-hero__placeholder" />
                    ) : featured?.imageUrl ? (
                      <img
                        src={featured.imageUrl}
                        alt=""
                        loading="eager"
                        className="vp-hero__img"
                      />
                    ) : (
                      <div className="vp-hero__placeholder" />
                    )}
                  </div>
                  <div className="vp-hero__content">
                    <div className="vp-hero__eyebrow">
                      {isHeroLoading ? (
                        <>
                          <span className="vp-badge">Loading</span>
                          <span className="vp-dot" aria-hidden="true" />
                          <span className="vp-meta">Fetching latest headline</span>
                        </>
                      ) : featured ? (
                        <>
                          <span className={`vp-badge ${isBreaking(featured.pubDate) ? 'vp-badge--alert' : ''}`}>
                            {isBreaking(featured.pubDate) ? 'Breaking' : 'Featured'}
                          </span>
                          <span className="vp-dot" aria-hidden="true" />
                          <span className={`vp-source ${featured.sourceColor}`}>
                            {featured.sourceName}
                          </span>
                          <span className="vp-dot" aria-hidden="true" />
                          <span className="vp-meta">{formatTimeAgo(featured.pubDate)}</span>
                        </>
                      ) : (
                        <span className="vp-meta">No featured story yet</span>
                      )}
                    </div>
                    <h2 id="featured-heading" className="vp-hero__title">
                      {isHeroLoading
                        ? 'Loading latest headline…'
                        : featured?.title || 'Central Valley headlines, curated for clarity.'}
                    </h2>
                    <p className="vp-hero__summary">
                      {isHeroLoading
                        ? 'Please wait a moment while we fetch the newest story.'
                        : featured?.description || localitySummary}
                    </p>
                    {featured?.link && !isHeroLoading ? (
                      <a
                        className="vp-button"
                        href={featured.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read full story
                      </a>
                    ) : (
                      <span className="vp-button vp-button--ghost" aria-hidden="true">
                        {isHeroLoading ? 'Loading…' : 'Stay informed'}
                      </span>
                    )}
                  </div>
                </article>
              </section>

              {/* Mobile-only weather disclosure, placed below hero */}
              <section className="vp-mobile-weather" aria-labelledby="mobile-conditions-heading">
                <div className="vp-card vp-card--panel vp-disclosure">
                  <button
                    type="button"
                    className="vp-disclosure__button"
                    aria-expanded={isWeatherOpen}
                    aria-controls={mobileWeatherId}
                    onClick={() => setIsWeatherOpen((v) => !v)}
                  >
                    <div>
                      <h2 id="mobile-conditions-heading" className="vp-section__title">Conditions</h2>
                      <span className="vp-meta">Weather + AQI</span>
                    </div>
                    <span
                      className={`vp-disclosure__icon ${isWeatherOpen ? 'is-open' : ''}`}
                      aria-hidden="true"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 15.5l-6-6 1.4-1.4L12 12.7l4.6-4.6L18 9.5z" />
                      </svg>
                    </span>
                  </button>
                  <div
                    id={mobileWeatherId}
                    className={`vp-disclosure__panel ${isWeatherOpen ? 'is-open' : ''}`}
                    role="region"
                    aria-labelledby="mobile-conditions-heading"
                  >
                    <div className="vp-disclosure__panel-inner vp-stack">
                      <WeatherCard locationKey="fresno" />
                      <WeatherCard locationKey="visalia" />
                    </div>
                  </div>
                </div>
              </section>

              <section id="headlines" className="vp-section" aria-labelledby="headlines-heading">
                <TabNav
                  currentTab={currentTab}
                  onTabChange={setCurrentTab}
                  lastUpdated={lastUpdated}
                />

                <div className="vp-filter" role="toolbar" aria-label="Category filter">
                  {CATEGORY_DEFS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="vp-chip"
                      aria-pressed={category === c.id}
                      data-active={category === c.id}
                      onClick={() => setCategory(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {loading && articles.length === 0 && (
                  <div className="vp-refreshing" role="status" aria-live="polite">
                    <span className="vp-refreshing__spinner" aria-hidden="true" />
                    <span className="vp-meta">Loading latest headlines…</span>
                  </div>
                )}

                {refreshing && !loading && (
                  <>
                    <div className="vp-refreshing" role="status" aria-live="polite">
                      <span className="vp-refreshing__spinner" aria-hidden="true" />
                      <span className="vp-meta">Refreshing…</span>
                    </div>
                    <div className="vp-grid vp-refresh-row" aria-hidden="true">
                      {REFRESH_GRADIENTS.slice(0, 3).map((grad) => (
                        <div key={grad} className="vp-refresh-card">
                          <div className={`vp-refresh-tone__overlay ${grad}`} />
                          <NewsCardSkeleton />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {loading && articles.length === 0 ? (
                  <div className="vp-grid">
                    <NewsCardSkeleton />
                    <NewsCardSkeleton />
                    <NewsCardSkeleton />
                    <NewsCardSkeleton />
                  </div>
                ) : error && articles.length === 0 ? (
                  <div className="vp-empty" role="status">
                    <p className="vp-empty__title">We couldn’t load headlines</p>
                    <p className="vp-empty__text">Please try refreshing the feed.</p>
                    <button
                      onClick={handleRefresh}
                      className="vp-button"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="vp-empty" role="status">
                    <p className="vp-empty__title">No headlines found</p>
                    <p className="vp-empty__text">Try a different category or county.</p>
                  </div>
                ) : (
                  <div className="vp-grid">
                    {secondary.slice(0, 24).map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="vp-aside" aria-label="Supplementary">
              <section id="conditions" className="vp-section vp-desktop-weather" aria-labelledby="conditions-heading">
                <div className="vp-section__header">
                  <h2 id="conditions-heading" className="vp-section__title">Conditions</h2>
                  <span className="vp-meta">Weather + AQI</span>
                </div>
                <div className="vp-stack">
                  <WeatherCard locationKey="fresno" />
                  <WeatherCard locationKey="visalia" />
                </div>
              </section>

              <section className="vp-section" aria-labelledby="insights-heading">
                <div className="vp-section__header">
                  <h2 id="insights-heading" className="vp-section__title">Local Focus</h2>
                  <span className="vp-meta">Coverage map</span>
                </div>
                <div className="vp-card vp-card--panel">
                  <p className="vp-body">
                    Valley Pulse curates trusted sources across Fresno and Tulare Counties, highlighting the
                    stories that shape daily life in the Central Valley.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <BottomNav />
      <Toast />
    </div>
  );
}