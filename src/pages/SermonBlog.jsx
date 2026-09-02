import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useCleanContent} from '../hooks/useCleanContent';
import supabase from '../lib/supabase';
import {formatDate} from '../utils/dateFormat';
import {sanitizeHtml} from '../utils/sanitizeHtml';

const {FiPlay,FiCalendar,FiUser,FiMessageCircle,FiHome,FiLayers,FiFilter}=FiIcons;

const SermonBlog=()=> {
  const [sermons,setSermons]=useState([]);
  const [sermonSeries,setSermonSeries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedSeries,setSelectedSeries]=useState('');
  const [currentPage,setCurrentPage]=useState(1);
  const sermonsPerPage=4;

  // Use the custom hook to clean inline styles
  useCleanContent();

  useEffect(()=> {
    fetchSermons();
    fetchSermonSeries();
  },[]);

  const fetchSermons=async ()=> {
    try {
      const {data,error}=await supabase
        .from('sermons_portal123')
        .select('*')
        .order('sermon_date',{ascending: false});

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error('Error fetching sermons:',error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSermonSeries=async ()=> {
    try {
      const {data,error}=await supabase
        .from('sermon_series_portal123')
        .select('*')
        .order('start_date',{ascending: false});

      if (error) throw error;
      setSermonSeries(data || []);
    } catch (error) {
      console.error('Error fetching sermon series:',error);
    }
  };

  const getYouTubeEmbedUrl=(url)=> {
    if (!url) return null;
    const regExp=/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match=url.match(regExp);
    return match && match[2].length===11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const getSeriesName=(seriesId)=> {
    const series=sermonSeries.find((s)=> s.id===seriesId);
    return series ? series.name : null;
  };

  const getSeriesDescription=(seriesId)=> {
    const series=sermonSeries.find((s)=> s.id===seriesId);
    return series ? series.description : null;
  };

  // Filter sermons based on selected series
  const filteredSermons=
    selectedSeries===''
      ? sermons
      : selectedSeries==='standalone'
        ? sermons.filter((sermon)=> !sermon.sermon_series_id)
        : sermons.filter((sermon)=> sermon.sermon_series_id===selectedSeries);

  // Pagination calculations
  const totalPages=Math.ceil(filteredSermons.length / sermonsPerPage);
  const indexOfLastSermon=currentPage * sermonsPerPage;
  const indexOfFirstSermon=indexOfLastSermon - sermonsPerPage;
  const currentSermons=filteredSermons.slice(indexOfFirstSermon,indexOfLastSermon);

  // Reset to page 1 when series filter changes
  useEffect(()=> {
    setCurrentPage(1);
  },[selectedSeries]);

  // Scroll to top when page changes
  const handlePageChange=(pageNumber)=> {
    setCurrentPage(pageNumber);
    window.scrollTo({top: 0,behavior: 'smooth'});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary font-inter">Loading sermons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiPlay} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl">
                Sermon Blog
              </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Weekly sermons and discussion questions for Table Groups
          </motion.p>
        </div>

        {/* Filter Section */}
        {(sermonSeries.length > 0 || sermons.some((s)=> !s.sermon_series_id)) && (
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.4}}
            className="bg-white rounded-2xl shadow-modern p-6 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiFilter} className="h-5 w-5 text-text-primary" />
                <span className="font-medium text-text-primary font-inter">
                  Filter by Series:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={()=> setSelectedSeries('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-inter ${
                    selectedSeries===''
                      ? 'bg-primary text-white'
                      : 'bg-accent text-text-primary hover:bg-accent-dark'
                  }`}
                >
                  All Sermons
                </button>
                {sermons.some((s)=> !s.sermon_series_id) && (
                  <button
                    onClick={()=> setSelectedSeries('standalone')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-inter ${
                      selectedSeries==='standalone'
                        ? 'bg-primary text-white'
                        : 'bg-accent text-text-primary hover:bg-accent-dark'
                    }`}
                  >
                    Standalone Sermons
                  </button>
                )}
                {sermonSeries.map((series)=> (
                  <button
                    key={series.id}
                    onClick={()=> setSelectedSeries(series.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-inter ${
                      selectedSeries===series.id
                        ? 'bg-primary text-white'
                        : 'bg-accent text-text-primary hover:bg-accent-dark'
                    }`}
                  >
                    {series.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Series Description */}
        {selectedSeries &&
          selectedSeries !=='standalone' &&
          selectedSeries !=='' && (
            <motion.div
              initial={{opacity: 0,y: 30}}
              animate={{opacity: 1,y: 0}}
              transition={{duration: 0.5}}
              className="bg-primary text-white rounded-lg p-6 mb-8"
            >
              <div className="flex items-center space-x-3 mb-3">
                <SafeIcon icon={FiLayers} className="h-6 w-6" />
                <h2 className="text-2xl">{getSeriesName(selectedSeries)}</h2>
              </div>
              {getSeriesDescription(selectedSeries) && (
                <p className="text-primary-light font-inter">
                  {getSeriesDescription(selectedSeries)}
                </p>
              )}
            </motion.div>
          )}

        {/* Sermons List */}
        <div className="space-y-12">
          {currentSermons.length===0 ? (
            <motion.div
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              className="bg-white rounded-2xl shadow-modern p-16 text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <SafeIcon icon={FiPlay} className="h-9 w-9 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {selectedSeries==='' ? 'No sermons yet' : 'No sermons in this series'}
              </h2>
              <p className="text-text-light max-w-xs mx-auto">Check back soon — new sermons will appear here after each service.</p>
            </motion.div>
          ) : (
            currentSermons.map((sermon,index)=> (
              <motion.div
                key={sermon.id}
                initial={{opacity: 0,y: 30}}
                animate={{opacity: 1,y: 0}}
                transition={{duration: 0.5,delay: index * 0.1}}
                className="bg-white rounded-2xl shadow-modern overflow-hidden hover:shadow-modern-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-8">
                  {/* Sermon Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-3xl text-text-primary">
                          {sermon.title}
                        </h2>
                        {sermon.sermon_series_id && selectedSeries==='' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white font-inter">
                            <SafeIcon icon={FiLayers} className="h-3 w-3 mr-1" />
                            {getSeriesName(sermon.sermon_series_id)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-text-light">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiCalendar} className="h-4 w-4" />
                          <span className="text-sm font-inter">
                            {formatDate(sermon.sermon_date)}
                          </span>
                        </div>
                        {sermon.speaker && (
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiUser} className="h-4 w-4" />
                            <span className="text-sm font-inter">{sermon.speaker}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* YouTube Video */}
                  {sermon.youtube_url && (
                    <div className="mb-8">
                      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <iframe
                          src={getYouTubeEmbedUrl(sermon.youtube_url)}
                          title={sermon.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Sermon Summary */}
                  {sermon.summary && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 text-text-primary">
                        Sermon Summary
                      </h3>
                      <div className="prose max-w-none">
                        <div
                          className="rendered-content text-text-primary font-inter"
                          dangerouslySetInnerHTML={{__html: sanitizeHtml(sermon.summary)}}
                        />
                      </div>
                    </div>
                  )}

                  {/* Discussion Questions */}
                  {sermon.discussion_questions && (
                    <div className="p-6 rounded-lg discussion-questions-section bg-gray-50">
                      <div className="flex items-center space-x-2 mb-4">
                        <SafeIcon
                          icon={FiMessageCircle}
                          className="h-5 w-5 text-primary"
                        />
                        <h3 className="text-xl font-bold text-text-primary">
                          Table Group Discussion Questions
                        </h3>
                      </div>
                      <div className="prose max-w-none">
                        <div
                          className="rendered-content text-text-primary font-inter"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(sermon.discussion_questions)
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredSermons.length > sermonsPerPage && (
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.5}}
            className="mt-12 flex flex-col items-center space-y-4"
          >
            <div className="flex items-center gap-3 w-full max-w-sm">
              <button
                onClick={()=> handlePageChange(currentPage - 1)}
                disabled={currentPage===1}
                className="flex-1 min-h-[52px] px-5 py-3 rounded-2xl bg-white text-text-primary font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white shadow-modern active:scale-95 font-inter"
              >
                ← Prev
              </button>

              <div className="flex items-center justify-center bg-white rounded-2xl shadow-modern px-5 py-3 min-h-[52px] min-w-[90px]">
                <span className="text-sm font-semibold text-text-primary font-inter">
                  {currentPage} / {totalPages}
                </span>
              </div>

              <button
                onClick={()=> handlePageChange(currentPage + 1)}
                disabled={currentPage===totalPages}
                className="flex-1 min-h-[52px] px-5 py-3 rounded-2xl bg-white text-text-primary font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white shadow-modern active:scale-95 font-inter"
              >
                Next →
              </button>
            </div>

            <p className="text-sm text-text-light font-inter">
              Showing {indexOfFirstSermon + 1}–{Math.min(indexOfLastSermon,filteredSermons.length)} of {filteredSermons.length} sermons
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SermonBlog;