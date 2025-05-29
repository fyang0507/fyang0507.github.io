import React from 'react';
import { motion } from 'framer-motion';

const Bio: React.FC = () => {
  return (
    <section className="pt-8 pb-16 bg-white dark:bg-slate-900" id="about">
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
              <div 
                className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg"
                style={{ 
                  outline: 'none', 
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <img 
                  src="/images/portrait.JPG" 
                  alt="Fred Yang - Portrait" 
                  className="w-full h-full object-cover transform scale-105"
                  style={{ 
                    outline: 'none !important', 
                    border: 'none !important',
                    boxShadow: 'none !important',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                />
              </div>
            </div>
            
            {/* Bio Content */}
            <div className="space-y-6">
              <h3>Where AI Meets Artistry</h3>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
                As an AI/ML engineer with a passion for photography, I bridge the gap between computational precision and creative expression. 
              </p>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
              By day I design and ship agentic and machine‑learning systems—optimizing models and prompts, wrangling data pipelines, and translating research into reliable products. Off the clock you'll find me behind a camera chasing light, lines, and stories. This blend of computational rigour and creative exploration shapes how I work: I prototype fast, iterate with intention, and measure what matters.
              </p>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
                I thrive in collaborative teams that value curiosity, craftsmanship, and clear communication. Long term, I'm driven by an entrepreneurial mindset: I love zero‑to‑one challenges and am happiest when ideas move from whiteboard to real‑world impact. Let's build something remarkable together.
              </p>
              
              <div className="pt-4">
                <h4 className="text-lg font-semibold mb-3">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="tag">Agentic Systems</span>
                  <span className="tag">Machine Learning</span>
                  <span className="tag">Data Science</span>
                  <span className="tag">Photography</span>
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