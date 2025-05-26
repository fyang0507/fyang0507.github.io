import React from 'react';
import { motion } from 'framer-motion';

interface TagCloudProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, selectedTags, onTagSelect }) => {
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
                bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100
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