import React, { useState, useEffect } from 'react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import CategoryFilter from '../components/gallery/CategoryFilter';
import YearFilter from '../components/gallery/YearFilter';
import Lightbox from '../components/gallery/Lightbox';
import { photos, photoCategories, photoYears } from '../data/photos';
import { Photo } from '../types';
import { motion } from 'framer-motion';

const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeYear, setActiveYear] = useState('all');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
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
    
    setFilteredPhotos(filtered);
  }, [activeCategory, activeYear]);
  
  // Lightbox handlers
  const openLightbox = (photo: Photo) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id);
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
      prevIndex < filteredPhotos.length - 1 ? prevIndex + 1 : prevIndex
    );
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
                onClick={() => {
                  setActiveCategory('all');
                  setActiveYear('all');
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
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
            Showing {filteredPhotos.length} of {photos.length} photos
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
                onClick={() => {
                  setActiveCategory('all');
                  setActiveYear('all');
                }}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            </div>
          ) : (
            <GalleryGrid photos={filteredPhotos} onPhotoClick={openLightbox} />
          )}
        </motion.div>
        
        <Lightbox 
          isOpen={lightboxOpen}
          currentPhoto={filteredPhotos[currentPhotoIndex] || null}
          onClose={closeLightbox}
          onPrev={goToPrevious}
          onNext={goToNext}
          hasPrev={currentPhotoIndex > 0}
          hasNext={currentPhotoIndex < filteredPhotos.length - 1}
        />
      </div>
    </main>
  );
};

export default GalleryPage;