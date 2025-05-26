import React from 'react';
import { motion } from 'framer-motion';

interface TagCloudProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, selectedTags, onTagSelect }) => {
  // Get tag colors based on the tag name for consistent coloring
  const getTagColor = (tag: string): string => {
    const colors = [
      'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100',
      'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100',
      'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100',
      'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-100',
      'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100',
      'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-100',
    ];
    
    // Get a consistent index based on the tag name
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">Filter by Tags</h3>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          
          return (
            <motion.button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${getTagColor(tag)}
                ${isSelected ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-primary-400 dark:ring-offset-slate-900' : ''}
                hover:shadow-md`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              #{tag}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TagCloud;