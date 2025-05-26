import React from 'react';
import { motion } from 'framer-motion';
import SocialLinks from '../common/SocialLinks';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen relative flex items-center pt-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/30 dark:to-dark -z-10"></div>
      
      <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="order-2 lg:order-1"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">
            <span className="text-primary-600 dark:text-primary-400">Your Name</span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl">AI Engineer & Photographer</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 my-6 max-w-2xl">
            Merging the analytical precision of artificial intelligence with the creative vision of photography. Exploring the intersection of technology and visual storytelling.
          </p>
          
          <div className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 italic mb-8 border-l-4 border-primary-500 pl-4 py-2">
            "Where computational intelligence meets creative expression"
          </div>
          
          <div className="flex items-center space-x-6 mb-8">
            <SocialLinks iconSize={24} />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="#featured" 
              className="btn-primary flex items-center justify-center"
            >
              View Featured Work
            </a>
            <a 
              href="/gallery" 
              className="btn-secondary flex items-center justify-center"
            >
              Explore Gallery
            </a>
          </div>
        </motion.div>
        
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="order-1 lg:order-2"
        >
          <div className="relative">
            <div className="w-full h-[500px] relative rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg" 
                alt="AI and Photography" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            
            {/* Floating accent elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-lg bg-primary-500/20 dark:bg-primary-600/20 -z-10"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-lg bg-accent-500/20 dark:bg-accent-600/20 -z-10"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;