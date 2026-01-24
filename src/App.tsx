import { useState, useCallback, useMemo, useEffect } from 'react';
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

  const {
    articles,
    currentTab,
    setCurrentTab,
    loading,
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
                <article className="vp-hero__card">
                  <div className="vp-hero__media" aria-hidden="true">
                    {featured?.imageUrl ? (
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
                      {featured ? (
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
                      {featured?.title || 'Central Valley headlines, curated for clarity.'}
                    </h2>
                    <p className="vp-hero__summary">
                      {featured?.description || localitySummary}
                    </p>
                    {featured?.link ? (
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
                        Stay informed
                      </span>
                    )}
                  </div>
                </article>
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
              <section id="conditions" className="vp-section" aria-labelledby="conditions-heading">
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