import React, { useState, useEffect } from 'react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import CategoryFilter from '../components/gallery/CategoryFilter';
import YearFilter from '../components/gallery/YearFilter';
import Lightbox from '../components/gallery/Lightbox';
import { photos, photoCategories, photoYears } from '../data/photos';
import { Photo } from '../types';
import { motion } from 'framer-motion';

const PHOTOS_PER_PAGE = 24; // Reduced from showing all photos at once

const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeYear, setActiveYear] = useState('all');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter photos when category or year changes
  useEffect(() => {
    let filtered = photos;
    
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
    
    // Sort by date in descending order (newest first)
    filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredPhotos(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeCategory, activeYear]);

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
            A collection of my favorite photographs from around the world, capturing moments of beauty and intrigue.
          </motion.p>
        </div>
        
        <div className="mb-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Filters
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
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
              Filter by Category
            </h3>
            <CategoryFilter 
              categories={photoCategories} 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
              Filter by Year
            </h3>
            <YearFilter 
              years={photoYears} 
              activeYear={activeYear} 
              onYearChange={setActiveYear} 
            />
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
            {activeCategory !== 'all' && ` in ${photoCategories.find(cat => cat.id === activeCategory)?.name}`}
            {activeYear !== 'all' && ` from ${activeYear}`}
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