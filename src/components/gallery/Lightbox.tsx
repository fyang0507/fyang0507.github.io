import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Photo } from '../../types';

interface LightboxProps {
  isOpen: boolean;
  currentPhoto: Photo | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  currentPhoto,
  onClose,
  onPrev,
  onNext,
  hasNext,
  hasPrev
}) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrev) onPrev();
          break;
        case 'ArrowRight':
          if (hasNext) onNext();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Lock scroll when lightbox is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);
  
  if (!currentPhoto) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 md:p-10"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 p-2 text-white bg-black/20 rounded-full z-10 hover:bg-black/40 transition-colors"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          
          {/* Navigation - Previous */}
          {hasPrev && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 text-white rounded-full z-10 hover:bg-black/40 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          {/* Navigation - Next */}
          {hasNext && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 text-white rounded-full z-10 hover:bg-black/40 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          )}
          
          {/* Main Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative max-w-screen-lg w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-h-[80vh] flex items-center justify-center">
              <img
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
            
            {/* Image Info */}
            <div className="w-full mt-4 text-white px-4 py-3 bg-black/30 backdrop-blur-sm rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{currentPhoto.title}</h3>
                  <p className="text-white/80 mt-1">{currentPhoto.description}</p>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <span className="px-3 py-1 rounded-full bg-white/10 capitalize">
                    {currentPhoto.category}
                  </span>
                  
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <time dateTime={currentPhoto.date}>
                      {new Date(currentPhoto.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;