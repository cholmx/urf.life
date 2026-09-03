import React,{useState,useEffect} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {SkeletonForm,LoadingTransition} from './LoadingSkeletons';
import {useToast} from '../hooks/useToast';

const {FiSave,FiRefreshCw}=FiIcons;

const AdminPodcast=()=> {
  const toast=useToast();
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [formData,setFormData]=useState({
    title: '',
    spotify_embed_url: '',
    description: ''
  });

  useEffect(()=> {
    fetchPodcastData();
  },[]);

  const fetchPodcastData=async ()=> {
    setLoading(true);
    try {
      const cached=localStorage.getItem('podcast_portal123');
      if (cached) {
        const data=JSON.parse(cached);
        if (data && data.length > 0) {
          setFormData({
            title: data[0].title || '',
            spotify_embed_url: data[0].spotify_embed_url || '',
            description: data[0].description || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching podcast data:',error);
    } finally {
      setTimeout(()=> setLoading(false),600);
    }
  };

  const handleSubmit=async (e)=> {
    e.preventDefault();
    setSaving(true);
    try {
      const podcastData=[
        {
          id: '1',
          title: formData.title,
          spotify_embed_url: formData.spotify_embed_url,
          description: formData.description,
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('podcast_portal123',JSON.stringify(podcastData));
      toast.success('Podcast updated successfully!');
    } catch (error) {
      console.error('Error saving podcast:',error);
      toast.error('Error saving podcast. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange=(e)=> {
    const {name,value}=e.target;
    setFormData((prev)=> ({...prev,[name]: value}));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-text-primary">Manage Podcast</h2>
        <button
          onClick={fetchPodcastData}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors inline-flex items-center space-x-2"
        >
          <SafeIcon icon={FiRefreshCw} className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
      <LoadingTransition isLoading={loading} skeleton={<SkeletonForm />}>
        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Podcast Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Episode title or podcast name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Spotify Embed URL *</label>
              <input
                type="url"
                name="spotify_embed_url"
                value={formData.spotify_embed_url}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://open.spotify.com/embed/episode/..."
              />
              <p className="text-sm text-text-light mt-1">
                Get the embed URL from Spotify: Share → Embed Episode → Copy the src URL
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full p-3 border border-accent-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Episode description (HTML allowed)"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 inline-flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Podcast'}</span>
            </button>
          </form>
        </motion.div>
        {formData.spotify_embed_url && (
          <motion.div
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg text-text-primary mb-4">Preview</h3>
            <div className="w-full h-96 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={formData.spotify_embed_url}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Podcast Preview"
              />
            </div>
          </motion.div>
        )}
      </LoadingTransition>
    </div>
  );
};

export default AdminPodcast;