import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import BookCard from '../components/BookCard';
import {SkeletonBookCard,LoadingTransition} from '../components/LoadingSkeletons';
import supabase from '../lib/supabase';
import StandardButton from '../components/StandardButton';

const {FiBookOpen,FiHome,FiExternalLink,FiTag,FiFilter,FiLink}=FiIcons;

const Resources=()=> {
  const [resources,setResources]=useState([]);
  const [categories,setCategories]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedCategory,setSelectedCategory]=useState('');
  const [error,setError]=useState(null);

  useEffect(()=> {
    fetchResources();
    fetchCategories();
  },[]);

  const fetchResources=async ()=> {
    try {
      setError(null);
      const {data,error}=await supabase
        .from('resources_portal123')
        .select('*')
        .order('created_at',{ascending: false});

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('❌ Error fetching resources:',error);
      setError('Failed to load resources: ' + error.message);
    } finally {
      // Add minimum delay to show skeleton
      setTimeout(()=> setLoading(false),800);
    }
  };

  const fetchCategories=async ()=> {
    try {
      const {data,error}=await supabase
        .from('resource_categories_portal123')
        .select('*')
        .order('name',{ascending: true});

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('❌ Error fetching categories:',error);
      setError('Failed to load categories: ' + error.message);
    }
  };

  const getCategoryName=(categoryId)=> {
    const category=categories.find((c)=> c.id===categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryInfo=(categoryId)=> {
    const category=categories.find((c)=> c.id===categoryId);
    return category || {name: 'Uncategorized',description: '',is_link_group: false};
  };

  // Filter resources based on selected category
  const filteredResources=
    selectedCategory===''
      ? resources
      : selectedCategory==='uncategorized'
        ? resources.filter((resource)=> !resource.category_id)
        : resources.filter((resource)=> resource.category_id===selectedCategory);

  // Group resources by category for display with UPPER ROOM BOOKS prioritized at top
  const groupedResources=()=> {
    if (selectedCategory !=='') {
      const categoryInfo=
        selectedCategory==='uncategorized'
          ? {name: 'Uncategorized',description: '',is_link_group: false}
          : getCategoryInfo(selectedCategory);
      return [{...categoryInfo,resources: filteredResources}];
    }

    const groups=[];

    // First,add UPPER ROOM BOOKS category if it exists and has resources
    const upperRoomCategory=categories.find(
      (cat)=>
        cat.name.toUpperCase().includes('UPPER ROOM BOOKS') ||
        cat.name.toUpperCase().includes('UPPER ROOM') ||
        cat.name.toLowerCase().includes('upper room books') ||
        cat.name.toLowerCase().includes('upper room')
    );
    if (upperRoomCategory) {
      const upperRoomResources=resources.filter(
        (r)=> r.category_id===upperRoomCategory.id
      );
      if (upperRoomResources.length > 0) {
        groups.push({
          ...upperRoomCategory,
          resources: upperRoomResources,
          isPriority: true // Mark as priority for special styling
        });
      }
    }

    // Then add all other categorized resources (excluding Upper Room Books since it's already added)
    categories.forEach((category)=> {
      // Skip if this is the Upper Room Books category (already added above)
      if (upperRoomCategory && category.id===upperRoomCategory.id) {
        return;
      }
      const categoryResources=resources.filter((r)=> r.category_id===category.id);
      if (categoryResources.length > 0) {
        groups.push({...category,resources: categoryResources});
      }
    });

    // Finally,add uncategorized resources at the end
    const uncategorizedResources=resources.filter((r)=> !r.category_id);
    if (uncategorizedResources.length > 0) {
      groups.push({
        name: 'Uncategorized',
        description: '',
        is_link_group: false,
        resources: uncategorizedResources
      });
    }

    return groups;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-accent py-12 relative">
        {/* Back to Home Button - Top Right */}
        <div className="fixed top-6 right-6 z-50">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
            <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
          </Link>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 font-inter">{error}</p>
            <div className="mt-4">
              <StandardButton
                onClick={()=> window.location.reload()}
                icon={FiIcons.FiRefreshCw}
              >
                Try Again
              </StandardButton>
            </div>
          </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiBookOpen} className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl">
              Resources
            </h1>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Helpful books,links,and materials for your faith journey
          </motion.p>
        </div>

        {/* Filter Section */}
        {(categories.length > 0 || resources.some((r)=> !r.category_id)) && (
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.4}}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiFilter} className="h-5 w-5 text-text-primary" />
                <span className="font-medium text-text-primary font-inter">
                  Filter by Category:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={()=> setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-inter ${
                    selectedCategory===''
                      ? 'bg-primary text-white'
                      : 'bg-accent text-text-primary hover:bg-accent-dark'
                  }`}
                >
                  All Resources
                </button>
                {categories.map((category)=> (
                  <button
                    key={category.id}
                    onClick={()=> setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-inter flex items-center space-x-1 ${
                      selectedCategory===category.id
                        ? 'bg-primary text-white'
                        : 'bg-accent text-text-primary hover:bg-accent-dark'
                    }`}
                  >
                    <SafeIcon
                      icon={category.is_link_group ? FiLink : FiBookOpen}
                      className="h-3 w-3"
                    />
                    <span>{category.name}</span>
                  </button>
                ))}
                {resources.some((r)=> !r.category_id) && (
                  <button
                    onClick={()=> setSelectedCategory('uncategorized')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-inter ${
                      selectedCategory==='uncategorized'
                        ? 'bg-primary text-white'
                        : 'bg-accent text-text-primary hover:bg-accent-dark'
                    }`}
                  >
                    Uncategorized
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Resources Display with Loading */}
        <LoadingTransition
          isLoading={loading}
          skeleton={
            resources.length===0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <SafeIcon
                  icon={FiBookOpen}
                  className="h-16 w-16 text-text-light mx-auto mb-4"
                />
                <h2 className="text-2xl mb-2">
                  Loading Resources...
                </h2>
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({length: 10}).map((_,i)=> (
                      <SkeletonBookCard key={i} />
                    ))}
                  </div>
                </div>
              </div>
            )
          }
        >
          {resources.length===0 ? (
            <motion.div
              initial={{opacity: 0,y: 30}}
              animate={{opacity: 1,y: 0}}
              className="bg-white rounded-lg shadow-md p-12 text-center"
            >
              <SafeIcon
                icon={FiBookOpen}
                className="h-16 w-16 text-text-light mx-auto mb-4"
              />
              <h2 className="text-2xl mb-2">
                No Resources Available
              </h2>
              <p className="text-text-light">
                Check back soon for helpful books and materials!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {groupedResources().map((group,groupIndex)=> (
                <motion.div
                  key={group.name}
                  initial={{opacity: 0,y: 30}}
                  animate={{opacity: 1,y: 0}}
                  transition={{duration: 0.5,delay: groupIndex * 0.1}}
                >
                  {/* Category Header with special styling for Upper Room Books */}
                  <div className="mb-6">
                    <div
                      className={`flex items-center space-x-3 mb-2 ${
                        group.isPriority ? 'p-4 rounded-lg' : ''
                      }`}
                      style={
                        group.isPriority ? {backgroundColor: '#E2BA49'} : {}
                      }
                    >
                      <SafeIcon
                        icon={group.is_link_group ? FiLink : FiBookOpen}
                        className={`h-6 w-6 ${
                          group.isPriority ? 'text-white' : 'text-primary'
                        }`}
                      />
                      <h2
                        className={`text-2xl ${
                          group.isPriority ? 'text-white' : 'text-text-primary'
                        }`}
                      >
                        {group.name}
                      </h2>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full font-inter ${
                          group.isPriority
                            ? 'bg-white bg-opacity-20 text-white'
                            : group.is_link_group
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {group.is_link_group
                          ? 'Link Collection'
                          : 'Book Collection'}
                      </span>
                    </div>
                    {group.description && (
                      <p
                        className={`font-inter ${
                          group.isPriority
                            ? 'text-white opacity-90 ml-4'
                            : 'text-text-light'
                        }`}
                      >
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Resources Grid - 5 columns */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {group.resources.map((resource,index)=> (
                      <motion.div
                        key={resource.id}
                        initial={{opacity: 0,y: 30}}
                        animate={{opacity: 1,y: 0}}
                        transition={{
                          duration: 0.5,
                          delay: groupIndex * 0.1 + index * 0.05
                        }}
                      >
                        <BookCard resource={resource} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </LoadingTransition>
      </div>
    </div>
  );
};

export default Resources;