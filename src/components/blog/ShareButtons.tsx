import React from 'react';
import { Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  // Encode the title and URL for sharing
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  
  // Function to copy the URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };
  
  return (
    <div className="flex items-center space-x-3">
      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Share:</span>
      
      <a 
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-[#1DA1F2] hover:text-white transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={16} />
      </a>
      
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-[#4267B2] hover:text-white transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={16} />
      </a>
      
      <a 
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-[#0077B5] hover:text-white transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={16} />
      </a>
      
      <button 
        onClick={copyToClipboard}
        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                  hover:bg-primary-500 hover:text-white transition-colors"
        aria-label="Copy link"
      >
        <Link2 size={16} />
      </button>
    </div>
  );
};

export default ShareButtons;