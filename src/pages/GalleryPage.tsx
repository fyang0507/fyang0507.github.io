import React, { useState, useEffect, useMemo } from 'react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import CategoryFilter from '../components/gallery/CategoryFilter';
import YearFilter from '../components/gallery/YearFilter';
import SortButton from '../components/gallery/SortButton';
import Lightbox from '../components/gallery/Lightbox';
import { photos } from '../data/photos';
import { Photo } from '../types';
import { motion } from 'framer-motion';

const PHOTOS_PER_PAGE = 18; // optimize for GitHub Pages performance

// Fisher-Yates shuffle algorithm for true randomization
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeYear, setActiveYear] = useState('all');
  const [sortMode, setSortMode] = useState<'random' | 'date'>('random');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Memoized randomized photos - only recalculate when photos array changes
  const randomizedPhotos = useMemo(() => shuffleArray(photos), []);
  
  // Calculate dynamic categories with counts based on current year filter
  const dynamicCategories = useMemo(() => {
    let photosToCount = photos;
    
    // If year filter is active, only count photos from that year
    if (activeYear !== 'all') {
      photosToCount = photos.filter(photo => 
        new Date(photo.date).getFullYear().toString() === activeYear
      );
    }
    
    // Count photos per category
    const categoryCounts = photosToCount.reduce((acc, photo) => {
      acc[photo.category] = (acc[photo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get unique categories and sort by count (descending)
    const categories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({ 
        id: category, 
        name: category.charAt(0).toUpperCase() + category.slice(1),
        count
      }));
    
    return [
      { id: 'all', name: 'All', count: photosToCount.length },
      ...categories
    ];
  }, [activeYear]);
  
  // Calculate dynamic years with counts based on current category filter
  const dynamicYears = useMemo(() => {
    let photosToCount = photos;
    
    // If category filter is active, only count photos from that category
    if (activeCategory !== 'all') {
      photosToCount = photos.filter(photo => photo.category === activeCategory);
    }
    
    // Count photos per year
    const yearCounts = photosToCount.reduce((acc, photo) => {
      const year = new Date(photo.date).getFullYear().toString();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get unique years and sort by year (descending)
    const years = Object.entries(yearCounts)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, count]) => ({ 
        id: year, 
        name: year,
        count
      }));
    
    return [
      { id: 'all', name: 'All Years', count: photosToCount.length },
      ...years
    ];
  }, [activeCategory]);
  
  // Filter and sort photos when category, year, or sort mode changes
  useEffect(() => {
    let filtered = sortMode === 'random' ? randomizedPhotos : photos;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(photo => photo.category === activeCategory);
    }
    
    // Filter by year
    if (activeYear !== 'all') {
      filtered = filtered.filter(photo => 
        new Date(photo.date).getFullYear().toString() === activeYear
      );
    }
    
    // Sort by date if in date mode (newest first)
    if (sortMode === 'date') {
      filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    // If in random mode, filtered array is already randomized from randomizedPhotos
    
    setFilteredPhotos(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeCategory, activeYear, sortMode, randomizedPhotos]);

  // Update displayed photos when filteredPhotos or currentPage changes
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * PHOTOS_PER_PAGE;
    setDisplayedPhotos(filteredPhotos.slice(startIndex, endIndex));
  }, [filteredPhotos, currentPage]);

  // Load more photos
  const loadMorePhotos = () => {
    if (currentPage * PHOTOS_PER_PAGE < filteredPhotos.length) {
      setIsLoading(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
      }, 300);
    }
  };

  // Check if there are more photos to load
  const hasMorePhotos = currentPage * PHOTOS_PER_PAGE < filteredPhotos.length;
  
  // Lightbox handlers
  const openLightbox = (photo: Photo) => {
    const index = displayedPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  
  const goToPrevious = () => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };
  
  const goToNext = () => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex < displayedPhotos.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handleClearFilters = () => {
    setActiveCategory('all');
    setActiveYear('all');
  };

  const handleSortChange = (mode: 'random' | 'date') => {
    setSortMode(mode);
  };
  
  return (
    <main className="pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Photography Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg"
          >
            People, Years, Life: In search of decisive moments where the mundane becomes miraculous, where time freezes to unveil the sacred geometry of fleeting souls.
          </motion.p>
        </div>
        
        <div className="mb-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Filters & Sorting
            </h2>
            {(activeCategory !== 'all' || activeYear !== 'all') && (
              <motion.button
                onClick={handleClearFilters}
                className="text-sm text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            )}
          </div>
          
          <div>
            <CategoryFilter 
              categories={dynamicCategories} 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />
          </div>
          
          <div>
            <YearFilter 
              years={dynamicYears} 
              activeYear={activeYear} 
              onYearChange={setActiveYear} 
            />
          </div>
          
          <div>
            <SortButton sortMode={sortMode} onSortChange={handleSortChange} />
          </div>
        </div>
        
        <div className="mb-6">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-slate-600 dark:text-slate-400"
          >
            Showing {displayedPhotos.length} of {filteredPhotos.length} photos
            {activeCategory !== 'all' && ` in ${dynamicCategories.find(cat => cat.id === activeCategory)?.name}`}
            {activeYear !== 'all' && ` from ${activeYear}`}
            {sortMode === 'random' ? ' (randomized)' : ' (sorted by date)'}
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                No photos found with the current filters.
              </p>
              <motion.button
                onClick={handleClearFilters}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            </div>
          ) : (
            <>
              <GalleryGrid photos={displayedPhotos} onPhotoClick={openLightbox} />
              
              {/* Load More Button */}
              {hasMorePhotos && (
                <div className="text-center mt-12">
                  <motion.button
                    onClick={loadMorePhotos}
                    disabled={isLoading}
                    className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      `Load More Photos (${filteredPhotos.length - displayedPhotos.length} remaining)`
                    )}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </motion.div>
        
        <Lightbox 
          isOpen={lightboxOpen}
          currentPhoto={displayedPhotos[currentPhotoIndex] || null}
          onClose={closeLightbox}
          onPrev={goToPrevious}
          onNext={goToNext}
          hasPrev={currentPhotoIndex > 0}
          hasNext={currentPhotoIndex < displayedPhotos.length - 1}
        />
      </div>
    </main>
  );
};

export default GalleryPage;