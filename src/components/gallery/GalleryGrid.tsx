import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { Photo } from '../../types';
import { Maximize2, Calendar } from 'lucide-react';

interface GalleryGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = memo(({ photos, onPhotoClick }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Breakpoint columns for masonry layout
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1
  };

  // Memoized function to generate a seeded random number based on photo ID
  const getSeededRandom = useCallback((photoId: string): number => {
    // Convert ID to number and use Math.sin for excellent distribution
    const num = parseInt(photoId, 10);
    
    // Math.sin creates excellent pseudo-random distribution
    // Multiply by large number to get different ranges of sin wave
    const randomValue = Math.sin(num * 12.9898) * 43758.5453;
    
    // Return fractional part (always between 0-1)
    return randomValue - Math.floor(randomValue);
  }, []);

  // Memoized image styles to avoid recalculation on every render
  const imageStyles = useMemo(() => {
    console.log('🔍 Debugging height calculation...');
    const styles: Record<string, { height: string }> = {};
    
    photos.forEach((photo) => {
      // Get single random value for this photo
      const randomFactor = getSeededRandom(photo.id) * 0.25;
      
      // Define absolute limits
      const estimatedWidth = 380; // Approximate width of each image container
      const minHeight = estimatedWidth + 25; // Always ensure height > width
      const maxHeight = 800; // Absolute maximum
      
      // Calculate base height with reduced random variation
      const heightRange = maxHeight - minHeight; // 395px range
      let finalHeight = Math.round(minHeight + (randomFactor * heightRange));
      
      // Hero bonus: occasionally make images dramatically larger
      const heroRandomFactor = getSeededRandom(photo.id + 'hero'); // Different seed for hero decision
      const isHero = heroRandomFactor > 0.85; // 15% chance to be a hero image
      
      if (isHero) {
        const heroBonus = 50 + (heroRandomFactor * 50); // 200-500px bonus
        finalHeight += heroBonus;
        finalHeight = Math.min(finalHeight, 800); // Cap hero images at 1200px
      }

      console.log(`Photo ID: ${photo.id}, Random: ${randomFactor.toFixed(3)}, Hero: ${isHero}, Height: ${finalHeight}px`);

      styles[photo.id] = {
        height: `${finalHeight}px`,
      };
    });
    
    console.log('📊 Height distribution:', Object.values(styles).map(s => s.height));
    return styles;
  }, [photos, getSeededRandom]);

  // Optimized hover handlers
  const handleMouseEnter = useCallback((photoId: string) => {
    setHoveredId(photoId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handlePhotoClick = useCallback((photo: Photo) => {
    onPhotoClick(photo);
  }, [onPhotoClick]);

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding masonry-column"
    >
      {photos.map((photo) => (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          key={photo.id}
          className="mb-4 relative rounded-lg overflow-hidden shadow-md cursor-pointer group gallery-item"
          onMouseEnter={() => handleMouseEnter(photo.id)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handlePhotoClick(photo)}
        >
          <div 
            className="overflow-hidden rounded-lg"
            style={imageStyles[photo.id]}
          >
            <img 
              src={photo.imageUrl} 
              alt={photo.location}
              className="w-full h-full object-cover transition-transform duration-300 ease-out gallery-image"
              style={{
                transform: hoveredId === photo.id ? 'scale(1.35)' : 'scale(1.1)'
              }}
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Simplified hover overlay - no AnimatePresence for better performance */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 gallery-overlay ${
              hoveredId === photo.id ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h3 className="text-white text-xl font-semibold">
              {photo.location}
            </h3>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/80 text-sm capitalize flex items-center">
                <span className="px-2 py-0.5 rounded-full bg-white/20">
                  {photo.category}
                </span>
              </span>
              
              <span className="text-white/80 text-sm flex items-center">
                <Calendar size={14} className="mr-1" />
                {new Date(photo.date).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            
            <div className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white">
              <Maximize2 size={16} />
            </div>
          </div>
        </motion.div>
      ))}
    </Masonry>
  );
});

GalleryGrid.displayName = 'GalleryGrid';

export default GalleryGrid;