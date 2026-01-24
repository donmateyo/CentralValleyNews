import { useState, useEffect, useCallback, useRef } from 'react';
import type { Article, CountyTab, NewsSource } from '../types';
import { NEWS_SOURCES, CORS_PROXIES, TULARE_KEYWORDS, FRESNO_KEYWORDS } from '../config';

// Generate unique ID for articles
function generateId(title: string, source: string): string {
  return `${source}-${title.slice(0, 50)}`.replace(/\s+/g, '-').toLowerCase();
}

// Small delay helper (with optional jitter)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with fallback through multiple CORS proxies
async function fetchWithFallback(sourceUrl: string): Promise<string> {
  const bustedUrl = `${sourceUrl}${sourceUrl.includes('?') ? '&' : '?'}_=${Date.now()}`;

  for (const proxyFn of CORS_PROXIES) {
    const proxyUrl = proxyFn(bustedUrl);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(proxyUrl, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const text = await res.text();
      if (text.trim().startsWith('<')) return text;
    } catch {
      continue;
    }
  }
  throw new Error('All proxies failed');
}

// Extract image URL from an RSS item - comprehensive approach
function extractImageUrl(item: Element, description: string): string | null {
  // 1. Check media:content elements (common in RSS feeds)
  const mediaElements = item.getElementsByTagName('media:content');
  for (let i = 0; i < mediaElements.length; i++) {
    const el = mediaElements[i];
    const url = el.getAttribute('url');
    const type = el.getAttribute('type') || '';
    const medium = el.getAttribute('medium') || '';
    if (url && (type.includes('image') || medium === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp)/i))) {
      return url;
    }
  }

  // 2. Check media:thumbnail
  const thumbnails = item.getElementsByTagName('media:thumbnail');
  if (thumbnails.length > 0) {
    const url = thumbnails[0].getAttribute('url');
    if (url) return url;
  }

  // 3. Check enclosure element
  const enclosures = item.getElementsByTagName('enclosure');
  for (let i = 0; i < enclosures.length; i++) {
    const el = enclosures[i];
    const url = el.getAttribute('url');
    const type = el.getAttribute('type') || '';
    if (url && type.includes('image')) {
      return url;
    }
  }

  // 4. Check content:encoded for img tags
  const contentEncoded = item.getElementsByTagName('content:encoded');
  if (contentEncoded.length > 0) {
    const content = contentEncoded[0].textContent || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  }

  // 5. Check description for img tags (with decoded HTML entities)
  const decodedDesc = description
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
  const imgMatch = decodedDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  // 6. Check for image element (Atom feeds)
  const imageEl = item.getElementsByTagName('image');
  if (imageEl.length > 0) {
    const url = imageEl[0].textContent || imageEl[0].getAttribute('href');
    if (url) return url;
  }

  return null;
}

// Clean description text - remove HTML tags and truncate
function cleanDescription(html: string): string {
  // Decode HTML entities
  const decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Remove HTML tags
  const text = decoded.replace(/<[^>]+>/g, '').trim();

  return text.slice(0, 300);
}

// Parse XML RSS feed
function parseXMLFeed(xmlText: string, source: NewsSource): Article[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Check for parse errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    console.warn(`Parse error for ${source.name}`);
    return [];
  }

  const items = xmlDoc.querySelectorAll('item');
  const articles: Article[] = [];

  items.forEach((item) => {
    const title = item.querySelector('title')?.textContent?.trim() || '';
    const link = item.querySelector('link')?.textContent?.trim() || '';
    const pubDateStr = item.querySelector('pubDate')?.textContent || '';
    const descriptionRaw = item.querySelector('description')?.textContent || '';

    // Skip items without title
    if (!title) return;

    // Extract image URL for THIS specific item
    const imageUrl = extractImageUrl(item, descriptionRaw);

    // Clean description
    const description = cleanDescription(descriptionRaw);

    // Parse date
    let pubDate = new Date(pubDateStr);
    if (isNaN(pubDate.getTime())) pubDate = new Date();

    articles.push({
      id: generateId(title, source.name),
      title,
      link,
      pubDate,
      imageUrl,
      sourceName: source.name,
      sourceColor: source.colorClass,
      description
    });
  });

  return articles;
}

// Check if article is LOCAL news (Central Valley related)
function isLocalArticle(article: Article): boolean {
  const text = (article.title + ' ' + article.description).toLowerCase();

  // Combined local keywords - all Central Valley cities and areas
  const localKeywords = [
    ...FRESNO_KEYWORDS,
    ...TULARE_KEYWORDS,
    'central valley', 'san joaquin', 'valley',
    'highway 99', 'hwy 99', 'sr 99',
    'highway 41', 'hwy 41', 'sr 41',
    'kings county', 'madera county', 'merced',
    'chp', 'calfire', 'pg&e', 'pge',
    'fcoe', 'fusd', 'vusd', 'tcoe'
  ];

  // Check if article contains any local keyword
  return localKeywords.some(keyword => text.includes(keyword));
}

// Filter articles by county
function filterByCounty(articles: Article[], tab: CountyTab): Article[] {
  return articles.filter(article => {
    const text = (article.title + ' ' + article.description).toLowerCase();

    const matchesTulare = TULARE_KEYWORDS.some(k => text.includes(k));
    const matchesFresno = FRESNO_KEYWORDS.some(k => text.includes(k));

    if (tab === 'tulare') {
      // Show Tulare articles, or if no specific county mentioned, show it
      return matchesTulare || (!matchesTulare && !matchesFresno);
    } else {
      // Show Fresno articles, or if no specific county mentioned, show it
      return matchesFresno || (!matchesTulare && !matchesFresno);
    }
  });
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentTab, setCurrentTab] = useState<CountyTab>('fresno');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [fetchTimestamp, setFetchTimestamp] = useState<number>(0);

  const latestRequestId = useRef(0);
  const articlesRef = useRef<Article[]>([]);
  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

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

  // Update the "last updated" text every minute
  useEffect(() => {
    if (fetchTimestamp === 0) return;
    const interval = setInterval(() => {
      updateLastUpdatedText(fetchTimestamp);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchTimestamp, updateLastUpdatedText]);

  const fetchNews = useCallback(async (showLoading = true) => {
    const requestId = ++latestRequestId.current;
    const safeSet = <T,>(setter: (v: T) => void, value: T) => {
      if (latestRequestId.current === requestId) setter(value);
    };

    const hasData = articlesRef.current.length > 0;

    if (showLoading && !hasData) {
      safeSet(setLoading, true);
      safeSet(setRefreshing, false);
    } else {
      safeSet(setLoading, false);
      safeSet(setRefreshing, true);
    }

    safeSet(setError, null);

    const MAX_RETRIES = 2; // total attempts = 3
    const BASE_DELAY = 800;

    let success = false;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const results = await Promise.all(
          NEWS_SOURCES.map(async (source) => {
            try {
              const xml = await fetchWithFallback(source.url);
              const parsed = parseXMLFeed(xml, source);
              return { source, articles: parsed, ok: true as const };
            } catch (e) {
              console.warn(`${source.name} failed:`, e);
              return { source, articles: [] as Article[], ok: false as const };
            }
          })
        );

        const allArticles = results.flatMap(r => r.articles);

        if (allArticles.length > 0) {
          // Filter to LOCAL news only
          const localArticles = allArticles.filter(isLocalArticle);

          // Remove duplicates by title similarity
          const seen = new Set<string>();
          const uniqueArticles = localArticles.filter(a => {
            const normalizedTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
            if (seen.has(normalizedTitle)) return false;
            seen.add(normalizedTitle);
            return true;
          });

          // Sort by date (newest first)
          uniqueArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

          safeSet(setArticles, uniqueArticles);
          const now = Date.now();
          safeSet(setFetchTimestamp, now);
          updateLastUpdatedText(now);
          safeSet(setError, null);
          success = true;
          break;
        }
      } catch (e) {
        console.error('News fetch error:', e);
      }

      if (attempt < MAX_RETRIES) {
        const jitter = Math.floor(Math.random() * 300);
        await delay(BASE_DELAY * Math.pow(2, attempt) + jitter);
      }
    }

    if (!success) {
      // If we already have articles, keep them and avoid surfacing an error.
      if (articlesRef.current.length === 0) {
        safeSet(setError, 'Unable to load news');
      } else {
        safeSet(setError, null);
      }
    }

    safeSet(setLoading, false);
    safeSet(setRefreshing, false);
  }, [updateLastUpdatedText]);

  // Initial load
  useEffect(() => {
    fetchNews(true);
  }, [fetchNews]);

  const filteredArticles = filterByCounty(articles, currentTab)
    .slice()
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return {
    articles: filteredArticles,
    allArticles: articles,
    currentTab,
    setCurrentTab,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh: () => fetchNews(true)
  };
}