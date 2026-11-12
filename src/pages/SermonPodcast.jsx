import React from 'react';
import PodcastPage from './PodcastPage';
import sermonPodcastRSSService from '../lib/sermonPodcastRSS';

export default function SermonPodcast() {
  return (
    <PodcastPage
      service={sermonPodcastRSSService}
      titleFallback="Sermon Podcast"
      subtitleFallback="Listen to our latest sermon episodes"
      accentColor="#2a3834"
      emptyStateText="Check back soon for new sermon episodes!"
    />
  );
}
