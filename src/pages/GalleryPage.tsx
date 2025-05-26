import React, { useState, useEffect } from 'react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import CategoryFilter from '../components/gallery/CategoryFilter';
import Lightbox from '../components/gallery/Lightbox';
import { photos, photoCategories } from '../data/photos';
import { Photo } from '../types';
import { motion } from 'framer-motion';

const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Filter photos when category changes
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(photo => photo.category === activeCategory));
    }
  }, [activeCategory]);
  
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
        
        <CategoryFilter 
          categories={photoCategories} 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GalleryGrid photos={filteredPhotos} onPhotoClick={openLightbox} />
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