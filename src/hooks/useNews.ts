import { useState, useEffect, useCallback } from 'react';
import type { Article, CountyTab, NewsSource } from '../types';
import { NEWS_SOURCES, CORS_PROXIES, TULARE_KEYWORDS, FRESNO_KEYWORDS } from '../config';

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
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(proxyUrl, { signal: controller.signal });
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
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [fetchTimestamp, setFetchTimestamp] = useState<number>(0);

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
    if (showLoading) setLoading(true);
    setError(null);

    const promises = NEWS_SOURCES.map(source =>
      fetchWithFallback(source.url)
        .then(xml => {
          const parsed = parseXMLFeed(xml, source);
          console.log(`${source.name}: fetched ${parsed.length} articles`);
          return parsed;
        })
        .catch((e) => {
          console.warn(`${source.name} failed:`, e);
          return [] as Article[];
        })
    );

    try {
      const results = await Promise.all(promises);
      const allArticles = results.flat();

      console.log(`Total articles fetched: ${allArticles.length}`);

      if (allArticles.length > 0) {
        // Filter to LOCAL news only
        const localArticles = allArticles.filter(isLocalArticle);
        console.log(`Local articles: ${localArticles.length}`);

        // Remove duplicates by title similarity
        const seen = new Set<string>();
        const uniqueArticles = localArticles.filter(a => {
          // Normalize title for deduplication
          const normalizedTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
          if (seen.has(normalizedTitle)) return false;
          seen.add(normalizedTitle);
          return true;
        });

        // Sort by date (newest first)
        uniqueArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

        setArticles(uniqueArticles);
        setFetchTimestamp(Date.now());
        updateLastUpdatedText(Date.now());
      } else {
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
    fetchNews(true);
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