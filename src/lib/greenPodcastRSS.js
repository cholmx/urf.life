// Green Podcast RSS feed config - see podcastRSSFactory.js for the shared logic.
import { createPodcastRSSService } from './podcastRSSFactory';

export default createPodcastRSSService({
  rssUrl: 'https://anchor.fm/s/108ad943c/podcast/rss',
  cacheKey: 'green_podcast_cache',
  parseDefaults: {
    title: 'Green Podcast',
    description: 'Green Podcast Episodes',
    author: 'Green Podcast',
  },
  fallback: {
    channel: {
      title: 'Green Podcast',
      description: 'Welcome to the Green Podcast. Join us for engaging conversations and inspiring content.',
      author: 'Green Podcast',
    },
    episode: {
      title: 'Welcome to Green Podcast',
      description: 'In our inaugural episode, we introduce the Green Podcast and share our vision for this journey together.',
      duration: '25:30',
      link: 'https://anchor.fm/s/108ad943c',
      summary: 'Welcome to our podcast journey as we explore new topics and conversations together.',
    },
  },
});
