import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { postsWithReadingTime } from '../data/posts';
import { Clock, Calendar, ArrowLeft, Languages } from 'lucide-react';
import ShareButtons from '../components/blog/ShareButtons';

const BlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const post = postsWithReadingTime.find(p => p.id === postId);
  const [relatedPosts, setRelatedPosts] = useState<typeof postsWithReadingTime>([]);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('en');
  
  // Scroll to top when component mounts or postId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [postId]);
  
  // Initialize language from URL parameter
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam === 'zh' && post?.isMultilingual) {
      setCurrentLanguage('zh');
    } else {
      setCurrentLanguage('en');
    }
  }, [searchParams, post]);
  
  // Scroll to top when language changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLanguage]);
  
  // Configure marked options for better Chinese support
  marked.setOptions({
    breaks: true, // Convert line breaks to <br>
    gfm: true, // Enable GitHub Flavored Markdown
  });

  // Parse markdown content to HTML
  const renderContent = (content: string) => {
    try {
      let processedContent = content;
      
      // For English content, convert single line breaks to paragraph breaks
      // This is needed because the markdown files use single line breaks between paragraphs
      if (currentLanguage === 'en') {
        processedContent = content
          // First, protect existing double line breaks by replacing them with a marker
          .replace(/\n\n/g, '___DOUBLE_BREAK___')
          // Convert single line breaks to double line breaks (paragraph separation)
          .replace(/\n/g, '\n\n')
          // Restore the original double line breaks (now they become quadruple)
          .replace(/___DOUBLE_BREAK___/g, '\n\n\n\n');
      }
      
      // Handle multiple blank lines for spacing
      processedContent = processedContent
        // Replace 4+ consecutive newlines with a large spacing div
        .replace(/\n\n\n\n+/g, '\n\n<div class="prose-spacing-large"></div>\n\n')
        // Replace exactly 3 newlines with enhanced spacing
        .replace(/\n\n\n/g, '\n\n<div class="prose-spacing-medium"></div>\n\n');
      
      const html = marked(processedContent);
      return { __html: html };
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback to plain text if parsing fails
      return { __html: `<p>${content.replace(/\n/g, '<br>')}</p>` };
    }
  };

  // Get current content based on selected language
  const getCurrentContent = () => {
    if (!post) return { title: '', excerpt: '', content: '', tags: [] };
    
    if (currentLanguage === 'zh' && post.content_zh) {
      return {
        title: post.title_zh || post.title,
        excerpt: post.excerpt_zh || post.excerpt,
        content: post.content_zh,
        tags: post.tags_zh || post.tags,
      };
    }
    
    return {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags,
    };
  };

  // Toggle language
  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };
  
  // Find related posts based on tags
  useEffect(() => {
    if (post) {
      const related = postsWithReadingTime
        .filter(p => p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
        .slice(0, 3);
      setRelatedPosts(related);
    }
  }, [post]);
  
  // Handle invalid post ID
  if (!post) {
    return (
      <div className="container-custom py-24 text-center">
        <h2 className="text-3xl font-bold">Post Not Found</h2>
        <p className="mt-4 mb-8">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog" className="btn-primary">
          Return to Blog
        </Link>
      </div>
    );
  }

  const currentContent = getCurrentContent();
  
  return (
    <main className="pt-24 pb-16">
      <article className="container-custom max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link to="/blog" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
            <ArrowLeft size={16} className="mr-2" />
            Back to All Posts
          </Link>
        </motion.div>

        {/* Language Toggle */}
        {post.isMultilingual && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 flex justify-end"
          >
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Languages size={16} className="mr-2" />
              {currentLanguage === 'en' ? '中文' : 'English'}
            </button>
          </motion.div>
        )}
        
        {/* Article Header */}
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {currentContent.tags.map(tag => (
              <Link
                key={tag}
                to={`/blog?tag=${tag}`}
                className="tag"
              >
                #{tag}
              </Link>
            ))}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            key={currentLanguage} // Force re-animation on language change
          >
            {currentContent.title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center text-sm text-slate-600 dark:text-slate-400 mb-8"
          >
            <div className="flex items-center mr-6 mb-2">
              <Calendar size={16} className="mr-2" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            
            <div className="flex items-center mb-2">
              <Clock size={16} className="mr-2" />
              <span>{post.readingTime} min read</span>
            </div>
          </motion.div>
          
          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-lg overflow-hidden shadow-lg mb-8"
          >
            <img 
              src={post.coverImage} 
              alt={currentContent.title} 
              className="w-full h-auto aspect-video object-cover"
            />
          </motion.div>
        </header>
        
        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          key={currentLanguage} // Force re-animation on language change
          className={`prose dark:prose-invert prose-lg max-w-none mb-12 lang-${currentLanguage}`}
          dangerouslySetInnerHTML={renderContent(currentContent.content)}
        />
        
        {/* Share Buttons */}
        <div className="border-t border-b border-slate-200 dark:border-slate-700 py-6 mb-12">
          <ShareButtons 
            title={currentContent.title}
            url={window.location.href}
          />
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">
              {currentLanguage === 'zh' ? '相关文章' : 'Related Posts'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => {
                // Determine the appropriate link and title based on current language
                const getRelatedPostLink = () => {
                  if (currentLanguage === 'zh' && relatedPost.isMultilingual && relatedPost.content_zh) {
                    return `/blog/${relatedPost.id}?lang=zh`;
                  }
                  return `/blog/${relatedPost.id}`;
                };
                
                const getRelatedPostTitle = () => {
                  if (currentLanguage === 'zh' && relatedPost.title_zh) {
                    return relatedPost.title_zh;
                  }
                  return relatedPost.title;
                };
                
                return (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card group"
                  >
                    <Link to={getRelatedPostLink()} className="block no-underline">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={relatedPost.coverImage} 
                          alt={getRelatedPostTitle()} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-lg font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {getRelatedPostTitle()}
                        </h4>
                        
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                          <Clock size={12} className="mr-1" />
                          <span>{relatedPost.readingTime} min read</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </main>
  );
};

export default BlogPost;