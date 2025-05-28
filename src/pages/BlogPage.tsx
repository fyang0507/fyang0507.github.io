import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { postsWithReadingTime, postYears } from '../data/posts';
import { Clock, Calendar } from 'lucide-react';
import TagCloud from '../components/blog/TagCloud';
import YearFilter from '../components/blog/YearFilter';

const BlogPage: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeYear, setActiveYear] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState(postsWithReadingTime);
  
  // Get all unique tags from posts (including Chinese tags)
  const allTags = Array.from(
    new Set(postsWithReadingTime.flatMap(post => [
      ...post.tags,
      ...(post.tags_zh || [])
    ]))
  ).sort();
  
  // Handle tag selection/deselection
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prevSelectedTags => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter(t => t !== tag);
      } else {
        return [...prevSelectedTags, tag];
      }
    });
  };
  
  // Filter posts when selected tags or year change
  useEffect(() => {
    let filtered = postsWithReadingTime;
    
    // Filter by tags (AND logic - post must have ALL selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post => 
        selectedTags.every(tag => 
          post.tags.includes(tag) || (post.tags_zh && post.tags_zh.includes(tag))
        )
      );
    }
    
    // Filter by year
    if (activeYear !== 'all') {
      if (activeYear === 'older') {
        // Filter for older years (more than 2 years ago)
        const currentYear = new Date().getFullYear();
        filtered = filtered.filter(post => 
          new Date(post.date).getFullYear() < currentYear - 2
        );
      } else {
        // Filter for specific year
        filtered = filtered.filter(post => 
          new Date(post.date).getFullYear().toString() === activeYear
        );
      }
    }
    
    setFilteredPosts(filtered);
  }, [selectedTags, activeYear]);
  
  return (
    <main className="pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg"
          >
            Dialogues at the crossroads of artificial intelligence, visual art, and the enduring mysteries of human experience.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Filters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-8 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-4">
              
              {/* Tag Filter */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                  Filter by Tags
                </h3>
                <TagCloud 
                  tags={allTags} 
                  selectedTags={selectedTags} 
                  onTagSelect={handleTagSelect} 
                />
              </div>
              
              {/* Year Filter */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                  Filter by Year
                </h3>
                <YearFilter 
                  years={postYears} 
                  activeYear={activeYear} 
                  onYearChange={setActiveYear} 
                />
              </div>
            </div>
          </div>
          
          {/* Blog Posts */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Clear Filters and Results Counter */}
            <div className="flex justify-between items-start">
              {/* Clear Filters Button - Aligned with Filter by Tags heading */}
              <div className="h-7 flex items-center">
                <AnimatePresence>
                  {(selectedTags.length > 0 || activeYear !== 'all') && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        setSelectedTags([]);
                        setActiveYear('all');
                      }}
                      className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear All Filters
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-slate-600 dark:text-slate-400 text-right text-sm mt-1"
              >
                Showing {filteredPosts.length} of {postsWithReadingTime.length} posts
                {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
                {activeYear !== 'all' && ` from ${activeYear === 'older' ? 'older years' : activeYear}`}
              </motion.p>
            </div>
            
            <div className="mb-6"></div>
            
            <motion.div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {filteredPosts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                      No posts found with the current filters.
                    </p>
                    <motion.button 
                      onClick={() => {
                        setSelectedTags([]);
                        setActiveYear('all');
                      }}
                      className="btn-secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear All Filters
                    </motion.button>
                  </motion.div>
                ) : (
                  filteredPosts.map((post) => (
                    <motion.article
                      key={post.id}
                      layout="position"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        layout: { duration: 0.3, ease: "easeInOut" },
                        opacity: { duration: 0.2 },
                        y: { duration: 0.3 }
                      }}
                      className="card overflow-hidden"
                    >
                      <div className="md:flex">
                        {/* Image (left on desktop) */}
                        <div className="md:w-1/3 overflow-hidden group">
                          <Link to={`/blog/${post.id}`} className="block h-full">
                            <img 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="h-48 md:h-full w-full object-cover transition-transform duration-600 ease-out scale-110 group-hover:scale-118"
                            />
                          </Link>
                        </div>
                        
                        {/* Content (right on desktop) */}
                        <div className="p-6 md:w-2/3">
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => handleTagSelect(tag)}
                                className={`tag cursor-pointer ${
                                  selectedTags.includes(tag) ? 
                                  'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                                }`}
                              >
                                #{tag}
                              </button>
                            ))}
                            {post.tags_zh && post.tags_zh.map(tag => (
                              <button
                                key={tag}
                                onClick={() => handleTagSelect(tag)}
                                className={`tag cursor-pointer ${
                                  selectedTags.includes(tag) ? 
                                  'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                                }`}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                          
                          {/* Chinese Title and Excerpt (if available) - Prioritized */}
                          {post.isMultilingual && post.title_zh && (
                            <div className="mb-4">
                              <Link to={`/blog/${post.id}?lang=zh`} className="no-underline">
                                <h2 className="text-2xl font-bold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                  {post.title_zh}
                                </h2>
                                {post.subtitle_zh && (
                                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-2 italic">
                                    {post.subtitle_zh}
                                  </p>
                                )}
                              </Link>
                              
                              {post.excerpt_zh && (
                                <p className="text-slate-600 dark:text-slate-400">
                                  {post.excerpt_zh}
                                </p>
                              )}
                            </div>
                          )}

                          {/* English Title and Excerpt */}
                          <div className={`mb-4 ${post.isMultilingual && post.title_zh ? 'border-l-4 border-slate-200 dark:border-slate-700 pl-4' : ''}`}>
                            <Link to={`/blog/${post.id}`} className="no-underline">
                              <h3 className={`${post.isMultilingual && post.title_zh ? 'text-xl text-slate-700 dark:text-slate-300' : 'text-2xl'} font-bold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}>
                                {post.title}
                              </h3>
                              {post.subtitle && (
                                <p className={`${post.isMultilingual && post.title_zh ? 'text-base text-slate-500 dark:text-slate-500' : 'text-lg text-slate-600 dark:text-slate-400'} mb-2 italic`}>
                                  {post.subtitle}
                                </p>
                              )}
                            </Link>
                            
                            <p className={`${post.isMultilingual && post.title_zh ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                              {post.excerpt}
                            </p>
                          </div>
                          
                          {/* Meta */}
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <div className="flex items-center mr-4">
                              <Calendar size={14} className="mr-1" />
                              <time dateTime={post.date}>
                                {new Date(post.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </time>
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span>{post.readingTime} min read</span>
                            </div>
                          </div>
                          
                          {/* Read More Buttons */}
                          <div className="flex flex-wrap gap-3">
                            {post.isMultilingual && post.content_zh && (
                              <Link 
                                to={`/blog/${post.id}?lang=zh`} 
                                className="btn-primary"
                              >
                                阅读全文
                              </Link>
                            )}
                            
                            <Link 
                              to={`/blog/${post.id}`} 
                              className={post.isMultilingual && post.content_zh ? "btn-secondary" : "btn-primary"}
                            >
                              Read More
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BlogPage;