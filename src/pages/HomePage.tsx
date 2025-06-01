import React, { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import ChatInterface from '../components/home/ChatInterface';
// import Bio from '../components/home/Bio';
import FeaturedPhotos from '../components/home/FeaturedPhotos';
import FeaturedPosts from '../components/home/FeaturedPosts';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);
  const [forceCompleted, setForceCompleted] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    if (hasVisited) {
      setChatStarted(true);
      setShowTypewriter(false);
      setForceCompleted(true);
    } else {
      setChatStarted(false);
      setShowTypewriter(false);
      setForceCompleted(false);
    }
    setCheckedSession(true);
  }, []);

  // Hide footer during landing mode
  useEffect(() => {
    if (!chatStarted) {
      document.body.classList.add('hide-footer');
    } else {
      document.body.classList.remove('hide-footer');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('hide-footer');
    };
  }, [chatStarted]);

  const handleStart = () => {
    setChatStarted(true);
    setShowTypewriter(true);
    setForceCompleted(false);
    sessionStorage.setItem('hasVisitedHome', 'true');
  };

  if (!checkedSession) return null; // Prevents flicker

  if (!chatStarted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-dark">
        {/* Optional: Add a welcoming heading */}
        {/* <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-800 dark:text-slate-100 text-center">Welcome to Fred Yang's World</h1> */}
        <div className="w-full max-w-xl px-4">
          <ChatInterface onStart={handleStart} autoStart={false} />
        </div>
      </main>
    );
  }

  return (
    <main>
      <ChatInterface onStart={() => {}} autoStart={showTypewriter} forceCompleted={forceCompleted} />
      <AnimatePresence>
        <motion.div
          key="homepage-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Hero />
          {/* <Bio /> */}
          <FeaturedPosts />
          <FeaturedPhotos />
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default HomePage;