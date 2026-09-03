import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import AudioPlayer from '../components/AudioPlayer';
import greenPodcastRSSService from '../lib/greenPodcastRSS';
import StandardButton from '../components/StandardButton';

const { FiMic, FiCalendar, FiHome, FiPlay, FiClock, FiRefreshCw, FiExternalLink, FiChevronDown, FiChevronUp, FiFilter } = FiIcons;

const Green = () => {
  const [podcastData, setPodcastData] = useState({ channel: null, episodes: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  const [showMoreCount, setShowMoreCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    fetchPodcastData();
  }, []);

  const fetchPodcastData = async () => {
    setLoading(true);
    try {
      const data = await greenPodcastRSSService.getEpisodes();
      setPodcastData(data);
    } catch (error) {
      console.error('Error fetching podcast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  const toggleEpisodeExpansion = (episodeId) => {
    if (expandedEpisode === episodeId) {
      setExpandedEpisode(null);
    } else {
      setExpandedEpisode(episodeId);
    }
  };

  const handleShowMore = () => {
    setShowMoreCount(prevCount => prevCount + 10);
  };

  const filteredEpisodes = podcastData.episodes.filter(episode => {
    if (!searchTerm) return true;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      episode.title.toLowerCase().includes(lowerCaseSearch) ||
      stripHtml(episode.description).toLowerCase().includes(lowerCaseSearch) ||
      stripHtml(episode.summary).toLowerCase().includes(lowerCaseSearch)
    );
  });

  const displayedEpisodes = filteredEpisodes.slice(0, showMoreCount);
  const hasMoreEpisodes = filteredEpisodes.length > showMoreCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary font-inter">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          style={{ backgroundColor: '#83A682' }}
          title="Back to Home"
        >
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-4 mb-3"
          >
            <SafeIcon icon={FiMic} className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary font-inter">
              {podcastData.channel?.title || 'Green Podcast'}
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center space-x-4"
          >
            <p className="text-lg text-text-primary page-subtitle">
              {podcastData.channel?.description || 'Listen to our latest episodes'}
            </p>
            <button
              onClick={fetchPodcastData}
              className="p-2 text-primary hover:text-primary-dark transition-colors"
              title="Refresh episodes"
            >
              <SafeIcon icon={FiRefreshCw} className="h-5 w-5" />
            </button>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <SafeIcon icon={FiFilter} className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold text-text-primary font-inter">
                Filter Episodes
              </h3>
            </div>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsFiltering(e.target.value.length > 0);
                  setShowMoreCount(10);
                }}
                className="w-full p-2 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
              />
            </div>
          </div>
          {isFiltering && (
            <div className="mt-2 text-sm text-text-light">
              Found {filteredEpisodes.length} matching episodes
            </div>
          )}
        </motion.div>

        {/* Episodes List */}
        {podcastData.episodes && podcastData.episodes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-inter">
              Episodes ({podcastData.episodes.length})
            </h2>

            {displayedEpisodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {episode.image && (
                      <img
                        src={episode.image}
                        alt={episode.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop';
                        }}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-text-primary font-inter">
                          {episode.title}
                        </h3>
                        {episode.audioUrl && (
                          <button
                            onClick={() => setSelectedEpisode(episode)}
                            className="ml-4 bg-white text-primary border-2 border-primary p-2 rounded-full hover:bg-primary hover:text-white transition-colors flex-shrink-0"
                            style={{ borderColor: '#83A682', color: '#83A682' }}
                            title="Play episode"
                          >
                            <SafeIcon icon={FiPlay} className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-text-light mb-3">
                        {episode.pubDate && (
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiCalendar} className="h-3 w-3" />
                            <span className="font-inter">{formatDate(episode.pubDate)}</span>
                          </div>
                        )}
                        {episode.duration && (
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiClock} className="h-3 w-3" />
                            <span className="font-inter">{episode.duration}</span>
                          </div>
                        )}
                      </div>

                      {episode.summary && (
                        <div className="mb-4">
                          {expandedEpisode === episode.id ? (
                            <p className="text-text-primary font-inter">
                              {stripHtml(episode.summary)}
                            </p>
                          ) : (
                            <p className="text-text-primary mb-2 font-inter">
                              {truncateText(stripHtml(episode.summary))}
                            </p>
                          )}
                          {stripHtml(episode.summary).length > 150 && (
                            <button
                              onClick={() => toggleEpisodeExpansion(episode.id)}
                              className="text-primary font-medium flex items-center space-x-1 mt-1"
                            >
                              <span>{expandedEpisode === episode.id ? 'Show Less' : 'Show More'}</span>
                              <SafeIcon icon={expandedEpisode === episode.id ? FiChevronUp : FiChevronDown} className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4">
                        {episode.audioUrl ? (
                          <StandardButton
                            onClick={() => setSelectedEpisode(episode)}
                            icon={FiPlay}
                          >
                            Play Episode
                          </StandardButton>
                        ) : (
                          <div className="bg-gray-100 text-text-light px-4 py-2 rounded-lg font-semibold inline-flex items-center space-x-2 font-inter">
                            <SafeIcon icon={FiPlay} className="h-4 w-4" />
                            <span>Audio Coming Soon</span>
                          </div>
                        )}

                        {episode.link && (
                          <StandardButton
                            onClick={() => window.open(episode.link,'_blank','noopener,noreferrer')}
                            icon={FiExternalLink}
                          >
                            View Online
                          </StandardButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Show More Button */}
            {hasMoreEpisodes && (
              <div className="text-center mt-8">
                <StandardButton
                  onClick={handleShowMore}
                  icon={FiChevronDown}
                >
                  Show More Episodes
                </StandardButton>
              </div>
            )}
          </div>
        )}

        {/* No Episodes State */}
        {!loading && (!filteredEpisodes || filteredEpisodes.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <SafeIcon icon={FiMic} className="h-16 w-16 text-text-light mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-inter">
              {searchTerm ? 'No Matching Episodes' : 'No Episodes Available'}
            </h2>
            <p className="text-text-light font-inter">
              {searchTerm ? 'Try a different search term' : 'Check back soon for new episodes!'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Audio Player */}
      <AnimatePresence>
        {selectedEpisode && selectedEpisode.audioUrl && (
          <AudioPlayer
            episode={selectedEpisode}
            onClose={() => setSelectedEpisode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Green;