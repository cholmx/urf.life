import React from 'react';
import PodcastPage from './PodcastPage';
import greenPodcastRSSService from '../lib/greenPodcastRSS';

export default function Green() {
  return (
    <PodcastPage
      service={greenPodcastRSSService}
      titleFallback="Green Podcast"
      subtitleFallback="Listen to our latest episodes"
      accentColor="#4a6d65"
      emptyStateText="Check back soon for new episodes!"
    />
  );
}
