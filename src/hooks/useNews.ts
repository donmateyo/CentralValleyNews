import { useState, useEffect, useCallback } from 'react';
import type { Article, CountyTab, NewsCache, NewsSource } from '../types';
import { NEWS_SOURCES, CORS_PROXIES, TULARE_KEYWORDS, FRESNO_KEYWORDS, CACHE_KEY } from '../config';

// Generate unique ID for articles
function generateId(title: string, source: string): string {
  return `${source}-${title.slice(0, 50)}`.replace(/\s+/g, '-').toLowerCase();
}

// Fetch with fallback through multiple CORS proxies
async function fetchWithFallback(sourceUrl: string): Promise<string> {
  for (const proxyFn of CORS_PROXIES) {
    const proxyUrl = proxyFn(sourceUrl);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const text = await res.text();
      if (text.trim().startsWith('<')) return text;
    } catch (e) {
      continue;
    }
  }
  throw new Error('All proxies failed');
}

// Parse XML RSS feed
function parseXMLFeed(xmlText: string, source: NewsSource): Article[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  return Array.from(xmlDoc.querySelectorAll('item')).map(item => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDateStr = item.querySelector('pubDate')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const content = item.getElementsByTagNameNS('*', 'content')[0]?.textContent || '';

    // Extract image URL
    let imageUrl: string | null = null;

    const mediaContent = item.getElementsByTagNameNS('*', 'content');
    for (let i = 0; i < mediaContent.length; i++) {
      const el = mediaContent[i];
      if (el.getAttribute('type')?.includes('image') || el.getAttribute('medium') === 'image') {
        imageUrl = el.getAttribute('url');
        break;
      }
    }

    if (!imageUrl) {
      const enclosure = item.querySelector('enclosure');
      if (enclosure?.getAttribute('type')?.includes('image')) {
        imageUrl = enclosure.getAttribute('url');
      }
    }

    if (!imageUrl) {
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/) ||
                       content.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) imageUrl = imgMatch[1];
    }

    let pubDate = new Date(pubDateStr);
    if (isNaN(pubDate.getTime())) pubDate = new Date();

    return {
      id: generateId(title, source.name),
      title,
      link,
      pubDate,
      imageUrl,
      sourceName: source.name,
      sourceColor: source.colorClass,
      description
    };
  });
}

// Filter articles by county
function filterByCounty(articles: Article[], tab: CountyTab): Article[] {
  return articles.filter(article => {
    const text = (article.title + ' ' + article.description).toLowerCase();
    const isTulare = TULARE_KEYWORDS.some(k => text.includes(k));
    const isFresno = FRESNO_KEYWORDS.some(k => text.includes(k));

    if (tab === 'tulare') return isTulare || !isFresno;
    return isFresno || !isTulare;
  });
}

// Load cache from localStorage
function loadCache(): { articles: Article[]; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: NewsCache = JSON.parse(cached);
      return {
        articles: data.articles.map(a => ({ ...a, pubDate: new Date(a.pubDate) })),
        timestamp: data.timestamp
      };
    }
  } catch (e) {
    console.warn('Cache load failed:', e);
  }
  return null;
}

// Save cache to localStorage
function saveCache(articles: Article[]): void {
  try {
    const cacheData: NewsCache = {
      timestamp: Date.now(),
      articles
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.warn('Cache save failed:', e);
  }
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentTab, setCurrentTab] = useState<CountyTab>('fresno');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const updateLastUpdatedText = useCallback((timestamp: number) => {
    const minsAgo = Math.floor((Date.now() - timestamp) / 60000);
    if (minsAgo < 1) {
      setLastUpdated('Updated just now');
    } else if (minsAgo < 60) {
      setLastUpdated(`Updated ${minsAgo}m ago`);
    } else {
      setLastUpdated('Updated a while ago');
    }
  }, []);

  const fetchNews = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    const promises = NEWS_SOURCES.map(source =>
      fetchWithFallback(source.url)
        .then(xml => parseXMLFeed(xml, source))
        .catch(() => [] as Article[])
    );

    try {
      const results = await Promise.all(promises);
      const allArticles = results.flat();

      if (allArticles.length > 0) {
        // Remove duplicates
        const seen = new Set<string>();
        const uniqueArticles = allArticles.filter(a => {
          if (seen.has(a.title)) return false;
          seen.add(a.title);
          return true;
        });

        // Sort by date
        uniqueArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

        setArticles(uniqueArticles);
        saveCache(uniqueArticles);
        updateLastUpdatedText(Date.now());
      } else if (articles.length === 0) {
        setError('Unable to load news');
      }
    } catch (e) {
      console.error('News fetch error:', e);
      if (articles.length === 0) {
        setError('Unable to load news');
      }
    } finally {
      setLoading(false);
    }
  }, [articles.length, updateLastUpdatedText]);

  // Initial load
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setArticles(cached.articles);
      updateLastUpdatedText(cached.timestamp);
      setLoading(false);
      // Refresh in background
      fetchNews(false);
    } else {
      fetchNews(true);
    }
  }, []);

  const filteredArticles = filterByCounty(articles, currentTab);

  return {
    articles: filteredArticles,
    allArticles: articles,
    currentTab,
    setCurrentTab,
    loading,
    error,
    lastUpdated,
    refresh: () => fetchNews(true)
  };
}
