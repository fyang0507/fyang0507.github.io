import React from 'react';
import { motion } from 'framer-motion';

const Bio: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900" id="about">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-center mb-16">About Me</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Bio Image */}
            <div className="relative">
              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg" 
                  alt="Portrait" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-5 -right-5 w-full h-full border-2 border-primary-500 dark:border-primary-400 rounded-lg -z-10"></div>
            </div>
            
            {/* Bio Content */}
            <div className="space-y-6">
              <h3>Where AI Meets Artistry</h3>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
                As an AI/ML engineer with a passion for photography, I bridge the gap between computational precision and creative expression. My work explores the fascinating intersection of artificial intelligence and visual storytelling.
              </p>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
                In my engineering work, I develop cutting-edge AI solutions that push the boundaries of what's possible. Behind the lens, I capture moments that reveal the subtle interplay of light, composition, and emotion. This unique perspective allows me to see patterns and possibilities that others might miss.
              </p>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
                Through my blog, I share insights that blend these two worlds—from AI-powered image processing techniques to the art of visual composition. Join me in exploring how technology and creativity can enhance each other.
              </p>
              
              <div className="pt-4">
                <h4 className="text-lg font-semibold mb-3">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="tag bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100">Machine Learning</span>
                  <span className="tag bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-100">Computer Vision</span>
                  <span className="tag bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100">Deep Learning</span>
                  <span className="tag bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100">Photography</span>
                  <span className="tag bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100">Image Processing</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Bio;