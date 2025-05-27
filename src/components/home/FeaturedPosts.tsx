import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { postsWithReadingTime } from '../../data/posts';

const FeaturedPosts: React.FC = () => {
  // Get the 3 most recent posts
  const recentPosts = [...postsWithReadingTime]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="container-custom">
        <div className="flex justify-between items-baseline mb-16">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Recent Articles
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              to="/blog" 
              className="group flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium hover:no-underline"
            >
              Read All Posts
              <ArrowRight 
                className="ml-1 transition-transform group-hover:translate-x-1" 
                size={18} 
              />
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card group h-full flex flex-col"
            >
              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out scale-110
                            group-hover:scale-125"
                />
              </div>
              
              {/* Content */}
              <div className="p-6 flex-grow flex flex-col">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="tag"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Chinese Title and Excerpt (if available) - Prioritized */}
                {post.isMultilingual && post.title_zh && (
                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title_zh}
                    </h3>
                    {post.subtitle_zh && (
                      <p className="text-base text-slate-600 dark:text-slate-400 mb-2 italic">
                        {post.subtitle_zh}
                      </p>
                    )}
                    
                    {post.excerpt_zh && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {post.excerpt_zh}
                      </p>
                    )}
                  </div>
                )}

                {/* English Title and Excerpt */}
                <div className={`mb-3 ${post.isMultilingual && post.title_zh ? 'border-l-2 border-slate-200 dark:border-slate-700 pl-3' : ''}`}>
                  <h4 className={`${post.isMultilingual && post.title_zh ? 'text-lg text-slate-700 dark:text-slate-300' : 'text-xl'} font-bold mb-2 ${post.isMultilingual && post.title_zh ? '' : 'group-hover:text-primary-600 dark:group-hover:text-primary-400'} transition-colors`}>
                    {post.title}
                  </h4>
                  {post.subtitle && (
                    <p className={`${post.isMultilingual && post.title_zh ? 'text-sm text-slate-500 dark:text-slate-500' : 'text-base text-slate-600 dark:text-slate-400'} mb-2 italic`}>
                      {post.subtitle}
                    </p>
                  )}
                  
                  <p className={`${post.isMultilingual && post.title_zh ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'} text-sm`}>
                    {post.excerpt}
                  </p>
                </div>
                
                {/* Footer */}
                <div className="mt-auto flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </time>
                  
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
                
                {/* Read More Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.isMultilingual && post.content_zh && (
                    <Link 
                      to={`/blog/${post.id}?lang=zh`} 
                      className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-800 dark:hover:text-primary-300 flex items-center group text-sm"
                    >
                      阅读全文
                      <ArrowRight 
                        className="ml-1 transition-transform group-hover:translate-x-1" 
                        size={14} 
                      />
                    </Link>
                  )}
                  
                  <Link 
                    to={`/blog/${post.id}`} 
                    className={`${post.isMultilingual && post.content_zh ? 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400' : 'text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300'} font-medium flex items-center group text-sm`}
                  >
                    Read More
                    <ArrowRight 
                      className="ml-1 transition-transform group-hover:translate-x-1" 
                      size={14} 
                    />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;