import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SocialLinks from '../common/SocialLinks';

const Hero: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleImage = () => {
    setIsRevealed(!isRevealed);
  };

  return (
    <section className="relative py-12">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/30 dark:to-dark -z-10"></div>
      
      <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="order-2 lg:order-1"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">
            <span className="text-primary-600 dark:text-primary-300">Fred Yang</span>
            <br />
            <span className="text-xl md:text-2xl lg:text-3xl">AI/ML Engineer & Photographer</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 my-6 max-w-2xl">
            Merging the analytical precision of artificial intelligence with the creative vision of photography. Exploring the intersection of technology and visual storytelling.
          </p>
          
          <div className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 italic mb-8 border-l-4 border-primary-500 pl-4 py-2">
            "Code, Camera & Curiosity"<br/>
            "世如未竟天工卷，格物致知珞玉心"
          </div>
          
          <div className="flex items-center space-x-6 mb-8">
            <SocialLinks iconSize={24} />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="/blog" 
              className="btn-primary flex items-center justify-center"
            >
              View Blogs
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
            <div className="w-[90%] h-[500px] mx-auto relative rounded-lg overflow-hidden shadow-2xl group cursor-pointer">
              {/* Animated Image (Default) */}
              <img 
                src="/images/jojo.png" 
                alt="Fred Yang - Animated Avatar" 
                className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                  isRevealed ? 'opacity-0' : 'opacity-100'
                }`}
              />
              
              {/* Real Image (Revealed) */}
              <img 
                src="/images/portrait.JPG" 
                alt="Fred Yang - AI/ML Engineer & Photographer" 
                className={`absolute inset-0 w-full h-full object-cover brightness-110 transition-opacity duration-700 ease-in-out ${
                  isRevealed ? 'opacity-100' : 'opacity-0'
                }`}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Toggle Button */}
              <button
                onClick={toggleImage}
                className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 flex items-center space-x-2 group-hover:bg-black/80"
                aria-label={isRevealed ? "Show animated version" : "Reveal real person"}
              >
                <span className="text-xs">
                  {isRevealed ? "🎨 Back to anime" : "📸 Reveal real me"}
                </span>
              </button>
            </div>
            
            {/* Floating accent elements */}
            <div className="absolute -bottom-3 -left-2 w-28 h-28 rounded-lg bg-primary-500/20 dark:bg-primary-600/20 -z-10"></div>
            <div className="absolute -top-3 -right-2 w-28 h-28 rounded-lg bg-accent-500/20 dark:bg-accent-600/20 -z-10"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;