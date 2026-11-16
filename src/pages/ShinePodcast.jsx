import React from 'react';
import PodcastPage from './PodcastPage';
import podcastRSSService from '../lib/podcastRSS';

export default function ShinePodcast() {
  return (
    <PodcastPage
      service={podcastRSSService}
      titleFallback="Shine Podcast"
      subtitleFallback="Listen to our latest podcast episodes"
      accentColor="#172B2C"
      emptyStateText="Check back soon for new podcast episodes!"
      normalizeTitleCase
      narrowSubtitle
    />
  );
}
