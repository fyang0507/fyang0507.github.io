import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { Photo } from '../../types';
import { Maximize2, Calendar } from 'lucide-react';

interface GalleryGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ photos, onPhotoClick }) => {
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

  // Function to generate a seeded random number based on photo ID
  const getSeededRandom = (photoId: string): number => {
    let hash = 0;
    for (let i = 0; i < photoId.length; i++) {
      const char = photoId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Use a different approach for better distribution
    const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
    return normalized;
  };

  // Function to calculate dynamic height with playful randomization
  const getImageStyle = (photo: Photo) => {
    // Use auto-detected aspect ratio, fallback to manual one, then to 1
    const aspectRatio = aspectRatios[photo.id] || photo.aspectRatio || 1;
    
    // Get multiple random values for better variation
    const randomFactor1 = getSeededRandom(photo.id);
    const randomFactor2 = getSeededRandom(photo.id + 'height');
    const randomFactor3 = getSeededRandom(photo.id + 'bonus');
    
    // Calculate approximate container width based on screen size and columns
    // In a 3-column layout with gaps, each image is roughly 33% - gaps
    // Assuming container is ~1200px max, each column is ~350-400px
    const estimatedWidth = 380; // Approximate width of each image container
    
    // Ensure height is always larger than width
    const minRequiredHeight = estimatedWidth + 50; // At least 50px taller than width
    
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
    const variation2 = (randomFactor3 - 0.5) * 300; // increase the height of the image
    
    // Occasionally make some images significantly larger (but not too extreme)
    const isLarger = randomFactor1 > 0.8; // 10% chance
    const sizeBonus = isLarger ? 100 + (randomFactor2 * 50) : 0; // 0-200px bonus
    
    // Calculate final height
    let finalHeight = Math.round(baseHeight + variation1 + variation2 + sizeBonus);
    
    // Ensure minimum (always > width) and reasonable maximum
    finalHeight = Math.max(minRequiredHeight, Math.min(900, finalHeight));

    // Debug logging
    console.log(`Photo ${photo.id}: ratio=${aspectRatio?.toFixed(2)}, width≈${estimatedWidth}px, height=${finalHeight}px, larger=${isLarger}`);

    return {
      height: `${finalHeight}px`,
    };
  };

  // Style for the image container
  const getContainerStyle = (photo: Photo) => {
    return getImageStyle(photo);
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {photos.map((photo) => (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          key={photo.id}
          className="mb-4 relative rounded-lg overflow-hidden shadow-md cursor-pointer group"
          onMouseEnter={() => setHoveredId(photo.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onPhotoClick(photo)}
        >
          <div 
            className="overflow-hidden rounded-lg"
            style={getContainerStyle(photo)}
          >
            <img 
              src={photo.imageUrl} 
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out scale-115 group-hover:scale-130"
              loading="lazy"
            />
          </div>

          <AnimatePresence>
            {(hoveredId === photo.id) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end"
              >
                <motion.h3 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-white text-xl font-semibold"
                >
                  {photo.title}
                </motion.h3>
                
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex justify-between items-center mt-2"
                >
                  <span className="text-white/80 text-sm capitalize flex items-center">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
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
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white"
                >
                  <Maximize2 size={16} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </Masonry>
  );
};

export default GalleryGrid;