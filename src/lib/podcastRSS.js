// Shine Podcast RSS feed config - see podcastRSSFactory.js for the shared logic.
import { createPodcastRSSService } from './podcastRSSFactory';

export default createPodcastRSSService({
  rssUrl: 'https://anchor.fm/s/34abb934/podcast/rss',
  cacheKey: 'shine_podcast_cache',
  parseDefaults: {
    title: 'Shine Podcast',
    description: 'Upper Room Fellowship Podcast',
    author: 'Upper Room Fellowship',
  },
  fallback: {
    channel: {
      title: 'Shine Podcast',
      description: 'Welcome to the Shine Podcast from Upper Room Fellowship. Join us as we explore faith, community, and living out God\'s love in our daily lives.',
      author: 'Upper Room Fellowship',
    },
    episode: {
      title: 'Welcome to Shine Podcast',
      description: 'In our inaugural episode, we introduce the Shine Podcast and share our vision for this journey together. We\'ll explore what it means to let our light shine in a world that desperately needs hope.',
      duration: '25:30',
      link: 'https://anchor.fm/s/34abb934',
      summary: 'Welcome to our podcast journey as we explore faith and community together.',
    },
  },
});
