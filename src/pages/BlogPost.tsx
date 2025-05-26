import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsWithReadingTime } from '../data/posts';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import ShareButtons from '../components/blog/ShareButtons';

const BlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState(postsWithReadingTime.find(p => p.id === postId));
  const [relatedPosts, setRelatedPosts] = useState<typeof postsWithReadingTime>([]);
  
  // Parse markdown-like content to HTML
  const renderContent = (content: string) => {
    // Simple parser for headers, paragraphs, and lists
    let html = content
      // Headers
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      // Lists
      .replace(/^\s*\n\* (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>')
      .replace(/^\s*\n- (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>')
      // Fix list closing tags
      .replace(/<\/ul>\s*\n<ul>/g, '')
      // Paragraphs
      .replace(/^\s*\n([^\n]+)\n/gim, '<p>$1</p>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    
    return { __html: html };
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
        
        {/* Article Header */}
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {post.tags.map(tag => (
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
          >
            {post.title}
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
              alt={post.title} 
              className="w-full h-auto aspect-video object-cover"
            />
          </motion.div>
        </header>
        
        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="prose dark:prose-invert prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={renderContent(post.content)}
        />
        
        {/* Share Buttons */}
        <div className="border-t border-b border-slate-200 dark:border-slate-700 py-6 mb-12">
          <ShareButtons 
            title={post.title}
            url={window.location.href}
          />
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="card group"
                >
                  <Link to={`/blog/${relatedPost.id}`} className="block no-underline">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={relatedPost.coverImage} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h4 className="text-lg font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {relatedPost.title}
                      </h4>
                      
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <Clock size={12} className="mr-1" />
                        <span>{relatedPost.readingTime} min read</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
};

export default BlogPost;