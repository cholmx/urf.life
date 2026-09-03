import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX } = FiIcons;

const AudioPlayer = ({ episode, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setLoading(false);
      console.error('Error loading audio');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [episode]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipTime = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-accent z-50"
    >
      <audio ref={audioRef} src={episode.audioUrl} preload="metadata" />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          {/* Episode Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {episode.image && (
              <img src={episode.image} alt={episode.title} className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-text-primary font-fraunces truncate">
                {episode.title}
              </h4>
              <p className="text-sm text-text-light font-inter">
                Sermon Podcast
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => skipTime(-15)}
              className="p-2 text-text-primary hover:text-primary transition-colors"
              title="Rewind 15s"
            >
              <SafeIcon icon={FiSkipBack} className="h-5 w-5" />
            </button>
            <button
              onClick={togglePlay}
              disabled={loading || !episode.audioUrl}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#2c4747' }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <SafeIcon icon={isPlaying ? FiPause : FiPlay} className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={() => skipTime(30)}
              className="p-2 text-text-primary hover:text-primary transition-colors"
              title="Forward 30s"
            >
              <SafeIcon icon={FiSkipForward} className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center space-x-2 text-sm text-text-light font-inter">
              <span>{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-2 bg-accent rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressPercent}%`, backgroundColor: '#2c4747' }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 text-text-primary hover:text-primary transition-colors"
            >
              <SafeIcon icon={isMuted ? FiVolumeX : FiVolume2} className="h-5 w-5" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-accent rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Close */}
          <button onClick={onClose} className="p-2 text-text-primary hover:text-primary transition-colors">
            <SafeIcon icon={FiIcons.FiX} className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;