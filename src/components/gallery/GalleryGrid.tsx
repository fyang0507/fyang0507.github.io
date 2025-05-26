import React, { useState } from 'react';
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

  // Breakpoint columns for masonry layout
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1
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
          <div className="overflow-hidden">
            <img 
              src={photo.imageUrl} 
              alt={photo.title}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
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