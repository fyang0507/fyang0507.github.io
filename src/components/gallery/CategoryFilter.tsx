import React from 'react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-3 px-1 py-1">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5
              ${
                activeCategory === category.id
                  ? 'bg-primary-500 text-white dark:bg-primary-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{category.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
            }`}>
              {category.count}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;