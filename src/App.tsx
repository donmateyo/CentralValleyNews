import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { WeatherCard } from './components/WeatherCard';
import { NewsCard, NewsCardSkeleton } from './components/NewsCard';
import { TabNav } from './components/TabNav';
import { Toast, showToast } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { useNews } from './hooks/useNews';

export default function App() {
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <main className="flex-1 w-full max-w-4xl mx-auto p-3 space-y-5">
        {/* Weather Section */}
        <section>
          <div className="flex justify-between items-end mb-2 px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Conditions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <WeatherCard locationKey="fresno" accentColor="bg-blue-500/10" />
            <WeatherCard locationKey="visalia" accentColor="bg-green-500/10" />
          </div>
          <div className="flex justify-end mt-1 px-1">
            <span className="text-[9px] text-slate-600">
              Weather by NWS | AQI by AirNow
            </span>
          </div>
        </section>

        {/* News Section */}
        <section>
          <TabNav
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            lastUpdated={lastUpdated}
          />

          {/* News Grid */}
          {loading && articles.length === 0 ? (
            <div className="grid grid-cols-2 gap-2 min-h-[200px]">
              <NewsCardSkeleton />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </div>
          ) : error && articles.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-xl">
              <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 256 256">
                <path d="M168,144a12,12,0,1,1-12-12A12,12,0,0,1,168,144ZM100,132a12,12,0,1,0,12,12A12,12,0,0,0,100,132Zm128,12A100,100,0,1,1,128,44,100.11,100.11,0,0,1,228,144Zm-16,0a84,84,0,1,0-84,84A84.09,84.09,0,0,0,212,144ZM168,172a52,52,0,0,1-80,0,8,8,0,1,0-12.31,10.23,68,68,0,0,0,104.62,0A8,8,0,0,0,168,172Z"/>
              </svg>
              <p className="text-slate-400 text-xs">Unable to load news</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 active:scale-95"
              >
                Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-xl">
              <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z"/>
              </svg>
              <p className="text-slate-400 text-xs">No headlines found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 min-h-[200px]">
              {articles.slice(0, 25).map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      <Toast />
    </div>
  );
}