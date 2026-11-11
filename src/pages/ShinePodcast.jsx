import React from 'react';
import PodcastPage from './PodcastPage';
import podcastRSSService from '../lib/podcastRSS';

export default function ShinePodcast() {
  return (
    <PodcastPage
      service={podcastRSSService}
      titleFallback="Shine Podcast"
      subtitleFallback="Listen to our latest podcast episodes"
      accentColor="#2B433E"
      emptyStateText="Check back soon for new podcast episodes!"
    />
  );
}
