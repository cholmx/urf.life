import React from 'react';
import PodcastPage from './PodcastPage';
import yellowPodcastRSSService from '../lib/yellowPodcastRSS';

export default function Yellow() {
  return (
    <PodcastPage
      service={yellowPodcastRSSService}
      titleFallback="Yellow Podcast"
      subtitleFallback="Listen to our latest episodes"
      accentColor="#EAA235"
      emptyStateText="Check back soon for new episodes!"
    />
  );
}
