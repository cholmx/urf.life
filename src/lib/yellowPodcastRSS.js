// Yellow Podcast RSS feed config - see podcastRSSFactory.js for the shared logic.
import { createPodcastRSSService } from './podcastRSSFactory';

export default createPodcastRSSService({
  rssUrl: 'https://anchor.fm/s/eeeaafa8/podcast/rss',
  cacheKey: 'yellow_podcast_cache',
  parseDefaults: {
    title: 'Yellow Podcast',
    description: 'Yellow Podcast Episodes',
    author: 'Yellow Podcast',
  },
  fallback: {
    channel: {
      title: 'Yellow Podcast',
      description: 'Welcome to the Yellow Podcast. Join us for engaging conversations and inspiring content.',
      author: 'Yellow Podcast',
    },
    episode: {
      title: 'Welcome to Yellow Podcast',
      description: 'In our inaugural episode, we introduce the Yellow Podcast and share our vision for this journey together.',
      duration: '25:30',
      link: 'https://anchor.fm/s/eeeaafa8',
      summary: 'Welcome to our podcast journey as we explore new topics and conversations together.',
    },
  },
});
