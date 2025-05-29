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
                As an AI/ML engineer with a passion for photography, I bridge the gap between computational precision and creative expression. 
              </p>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
              By day I design and ship production‑grade machine‑learning systems—optimizing models, wrangling data pipelines, and translating research into reliable products. Off the clock you’ll find me behind a camera chasing light, lines, and stories. This blend of computational rigour and creative exploration shapes how I work: I prototype fast, iterate with intention, and measure what matters.
              </p>
              
              <p className="text-lg text-slate-700 dark:text-slate-300">
                I thrive in collaborative teams that value curiosity, craftsmanship, and clear communication. Long term, I’m driven by an entrepreneurial mindset: I love zero‑to‑one challenges and am happiest when ideas move from whiteboard to real‑world impact. Let’s build something remarkable together.
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