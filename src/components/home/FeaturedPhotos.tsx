import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { photos } from '../../data/photos';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedPhotos: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Select first 4 photos for featured section
  const featuredPhotos = photos.slice(0, 4);
  
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-800" id="featured">
      <div className="container-custom">
        <div className="flex justify-between items-baseline mb-16">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Featured Photography
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              to="/gallery" 
              className="group flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium hover:no-underline"
            >
              View All Work
              <ArrowRight 
                className="ml-1 transition-transform group-hover:translate-x-1" 
                size={18} 
              />
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative rounded-lg overflow-hidden shadow-lg group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title} 
                  className="w-full h-full object-cover transition-transform duration-700 
                            group-hover:scale-105"
                />
                
                {/* Overlay with details */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 flex flex-col justify-end
                            transition-opacity duration-300 ${
                              hoveredIndex === index ? 'opacity-100' : 'opacity-0 md:opacity-70'
                            }`}
                >
                  <h3 className="text-white text-xl md:text-2xl font-bold">{photo.title}</h3>
                  <p className="text-white/80 mt-2">{photo.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                      {photo.category}
                    </span>
                    <span className="text-white/70 text-sm">
                      {new Date(photo.date).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPhotos;