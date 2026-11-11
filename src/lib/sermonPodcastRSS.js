// Sermon Podcast RSS feed config - see podcastRSSFactory.js for the shared logic.
import { createPodcastRSSService } from './podcastRSSFactory';

export default createPodcastRSSService({
  rssUrl: 'https://anchor.fm/s/2fa685e0/podcast/rss',
  cacheKey: 'sermon_podcast_cache',
  parseDefaults: {
    title: 'Sermon Podcast',
    description: 'Upper Room Fellowship Sermon Podcast',
    author: 'Upper Room Fellowship',
  },
  fallback: {
    channel: {
      title: 'Sermon Podcast',
      description: 'Welcome to the Sermon Podcast from Upper Room Fellowship. Join us as we explore faith, community, and living out God\'s love in our daily lives.',
      author: 'Upper Room Fellowship',
    },
    episode: {
      title: 'Welcome to our Sermon Podcast',
      description: 'In this sermon, we explore the foundations of faith and how we can apply biblical principles to our daily lives.',
      duration: '35:45',
      link: 'https://anchor.fm/s/2fa685e0',
      summary: 'Welcome to our sermon podcast where we explore faith and scripture together.',
    },
  },
});
