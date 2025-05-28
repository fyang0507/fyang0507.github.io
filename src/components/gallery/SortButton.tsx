import React from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Calendar } from 'lucide-react';

interface SortButtonProps {
  sortMode: 'random' | 'date';
  onSortChange: (mode: 'random' | 'date') => void;
}

const SortButton: React.FC<SortButtonProps> = ({ sortMode, onSortChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
        Sort by:
      </span>
      <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
        <motion.button
          onClick={() => onSortChange('random')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            sortMode === 'random'
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shuffle size={14} />
          <span>Random</span>
        </motion.button>
        
        <motion.button
          onClick={() => onSortChange('date')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            sortMode === 'date'
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Calendar size={14} />
          <span>Date</span>
        </motion.button>
      </div>
    </div>
  );
};

export default SortButton; 