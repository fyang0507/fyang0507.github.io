import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  // Breakpoint columns for masonry layout
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1
  };

  // Auto-detect aspect ratios when component mounts or photos change
  useEffect(() => {
    const loadImageAspectRatios = async () => {
      const ratios: Record<string, number> = {};
      
      const promises = photos.map((photo) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ratios[photo.id] = img.width / img.height;
            resolve();
          };
          img.onerror = () => {
            // Fallback to 1:1 aspect ratio if image fails to load
            ratios[photo.id] = 1;
            resolve();
          };
          img.src = photo.imageUrl;
        });
      });

      await Promise.all(promises);
      setAspectRatios(ratios);
    };

    loadImageAspectRatios();
  }, [photos]);

  // Memoized function to generate a seeded random number based on photo ID
  const getSeededRandom = useCallback((photoId: string): number => {
    let hash = 0;
    for (let i = 0; i < photoId.length; i++) {
      const char = photoId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Use a different approach for better distribution
    const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
    return normalized;
  }, []);

  // Memoized image styles to avoid recalculation on every render
  const imageStyles = useMemo(() => {
    const styles: Record<string, { height: string }> = {};
    
    photos.forEach((photo) => {
      // Use auto-detected aspect ratio, fallback to manual one, then to 1
      const aspectRatio = aspectRatios[photo.id] || photo.aspectRatio || 1;
      
      // Get multiple random values for better variation
      const randomFactor1 = getSeededRandom(photo.id);
      const randomFactor2 = getSeededRandom(photo.id + 'height');
      const randomFactor3 = getSeededRandom(photo.id + 'bonus');
      
      // Calculate approximate container width based on screen size and columns
      const estimatedWidth = 380; // Approximate width of each image container
      
      // Ensure height is always larger than width
      const minRequiredHeight = estimatedWidth + 75; // At least 75px taller than width
      
      // Base height range depending on aspect ratio (but always > width)
      let minHeight: number;
      let maxHeight: number;
      
      if (aspectRatio > 1.3) {
        // Wide horizontal images - need more height to counteract their natural width
        minHeight = Math.max(minRequiredHeight, 400);
        maxHeight = 700;
      } else if (aspectRatio > 1.0) {
        // Slightly horizontal images  
        minHeight = Math.max(minRequiredHeight, 350);
        maxHeight = 600;
      } else if (aspectRatio > 0.8) {
        // Square-ish images
        minHeight = Math.max(minRequiredHeight, 320);
        maxHeight = 550;
      } else {
        // Vertical images - naturally tall, but ensure still > width
        minHeight = Math.max(minRequiredHeight, 300);
        maxHeight = 500;
      }
      
      // Calculate height using continuous random distribution (not categories)
      const heightRange = maxHeight - minHeight;
      const baseHeight = minHeight + (randomFactor1 * heightRange);
      
      // Add additional random variation layers
      const variation1 = (randomFactor2 - 0.5) * 200; // stretch or squeeze an image
      const variation2 = (randomFactor3 - 0.5) * 350; // increase the height of the image
      
      // Occasionally make some images significantly larger (but not too extreme)
      const isLarger = randomFactor1 > 0.8; // 10% chance
      const sizeBonus = isLarger ? 100 + (randomFactor2 * 50) : 0; // 0-100px bonus
      
      // Calculate final height
      let finalHeight = Math.round(baseHeight + variation1 + variation2 + sizeBonus);
      
      // Ensure minimum (always > width) and reasonable maximum
      finalHeight = Math.max(minRequiredHeight, Math.min(900, finalHeight));

      styles[photo.id] = {
        height: `${finalHeight}px`,
      };
    });
    
    return styles;
  }, [photos, aspectRatios, getSeededRandom]);

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
              alt={photo.title}
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
              {photo.title}
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