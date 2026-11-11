// Builds a podcast RSS service from one feed's own config. All 4 podcast
// feeds this site embeds (Shine, Green, Yellow, Sermon) used to be ~266
// lines of copy-pasted fetch/parse/cache logic each, differing only in
// the RSS URL, cache key, and the text below used when the feed itself
// doesn't supply a value (parseDefaults, for a live feed missing a tag)
// or is unreachable entirely (fallback, the fully-offline placeholder
// episode). Each of src/lib/{podcastRSS,greenPodcastRSS,yellowPodcastRSS,
// sermonPodcastRSS}.js is now just that config, instantiated here.
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop';
const PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

export function createPodcastRSSService({ rssUrl, cacheKey, parseDefaults, fallback }) {
  function getTextContent(element, selector) {
    if (!element) return '';
    const selectors = selector.split(',');
    for (const sel of selectors) {
      try {
        const found = element.querySelector(sel.replace('\\:', ':'));
        if (found && found.textContent) return found.textContent.trim();
      } catch {
        const simpleSelector = sel.replace('itunes\\:', '').replace('itunes:', '');
        const found = element.querySelector(simpleSelector);
        if (found && found.textContent) return found.textContent.trim();
      }
    }
    return '';
  }

  function getImageUrl(element) {
    if (!element) return '';
    const imageSelectors = ['itunes\\:image', 'itunes:image', 'image[href]', 'image url', 'image'];
    for (const selector of imageSelectors) {
      try {
        const imageElement = element.querySelector(selector);
        if (imageElement) {
          const url = imageElement.getAttribute('href') || imageElement.getAttribute('url') || imageElement.textContent?.trim();
          if (url && url.startsWith('http')) return url;
        }
      } catch {
        continue;
      }
    }
    return '';
  }

  function formatDuration(duration) {
    if (!duration) return '';
    if (duration.includes(':')) return duration;
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function getFallbackData() {
    return {
      channel: {
        ...fallback.channel,
        link: rssUrl,
        image: DEFAULT_IMAGE,
        language: 'en',
      },
      episodes: [
        {
          ...fallback.episode,
          id: 'fallback-1',
          audioUrl: null,
          pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          guid: 'fallback-guid-1',
          image: DEFAULT_IMAGE,
        },
      ],
      lastUpdated: new Date().toISOString(),
      isFallback: true,
    };
  }

  function parseRSSFeed(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) throw new Error('XML parsing failed');

      const channel = xmlDoc.querySelector('channel');
      if (!channel) throw new Error('No channel element found in RSS');

      const items = xmlDoc.querySelectorAll('item');
      const channelInfo = {
        title: getTextContent(channel, 'title') || parseDefaults.title,
        description: getTextContent(channel, 'description') || parseDefaults.description,
        image: getImageUrl(channel) || DEFAULT_IMAGE,
        link: getTextContent(channel, 'link'),
        language: getTextContent(channel, 'language') || 'en',
        author: getTextContent(channel, 'itunes\\:author,author') || parseDefaults.author,
      };

      const episodes = Array.from(items).slice(0, 50).map((item, index) => {
        const enclosure = item.querySelector('enclosure');
        const duration = getTextContent(item, 'itunes\\:duration');
        const pubDate = getTextContent(item, 'pubDate');
        return {
          id: `episode-${index}`,
          title: getTextContent(item, 'title') || `Episode ${index + 1}`,
          description: getTextContent(item, 'description') || getTextContent(item, 'itunes\\:summary') || '',
          audioUrl: enclosure ? enclosure.getAttribute('url') : null,
          duration: formatDuration(duration) || '00:00',
          pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          link: getTextContent(item, 'link'),
          guid: getTextContent(item, 'guid') || `guid-${index}`,
          image: getImageUrl(item) || channelInfo.image,
          summary: getTextContent(item, 'itunes\\:summary') || getTextContent(item, 'description') || '',
        };
      }).filter(episode => episode.title && episode.title !== '');

      return { channel: channelInfo, episodes, lastUpdated: new Date().toISOString() };
    } catch {
      return getFallbackData();
    }
  }

  async function fetchWithProxy(proxyIndex = 0) {
    if (proxyIndex >= PROXIES.length) throw new Error('All proxy services failed');
    try {
      const proxy = PROXIES[proxyIndex];
      const url = proxy.includes('allorigins') ? `${proxy}${encodeURIComponent(rssUrl)}` : `${proxy}${rssUrl}`;
      const response = await fetch(url, { headers: { Accept: 'application/json,text/plain,*/*' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const xmlContent = data.contents || data.content || data;
      if (!xmlContent || typeof xmlContent !== 'string') throw new Error('Invalid response format from proxy');
      return xmlContent;
    } catch {
      return fetchWithProxy(proxyIndex + 1);
    }
  }

  async function fetchPodcastFeed() {
    try {
      try {
        const directResponse = await fetch(rssUrl);
        if (directResponse.ok) {
          const directXml = await directResponse.text();
          return parseRSSFeed(directXml);
        }
      } catch {
        // Direct fetch failed, fall through to the proxy fetch below.
      }
      const xmlContent = await fetchWithProxy();
      return parseRSSFeed(xmlContent);
    } catch {
      console.error('All fetch methods failed');
      return getFallbackData();
    }
  }

  function cacheEpisodes(data) {
    try {
      const cacheData = { ...data, cached_at: new Date().toISOString() };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching episodes:', error);
    }
  }

  function getCachedEpisodes() {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      const data = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(data.cached_at).getTime();
      const maxAge = data.isFallback ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
      if (cacheAge > maxAge) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  async function getEpisodes() {
    const cached = getCachedEpisodes();
    if (cached) return cached;
    const data = await fetchPodcastFeed();
    cacheEpisodes(data);
    return data;
  }

  return { getEpisodes, fetchPodcastFeed, parseRSSFeed, getFallbackData };
}
