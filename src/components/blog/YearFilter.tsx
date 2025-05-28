import React from 'react';
import { motion } from 'framer-motion';

interface Year {
  id: string;
  name: string;
}

interface YearFilterProps {
  years: Year[];
  activeYear: string;
  onYearChange: (yearId: string) => void;
}

const YearFilter: React.FC<YearFilterProps> = ({ 
  years, 
  activeYear, 
  onYearChange 
}) => {
  const handleYearClick = (yearId: string) => {
    // If clicking the currently active year (and it's not "all"), deselect it
    if (activeYear === yearId && yearId !== 'all') {
      onYearChange('all');
    } else {
      onYearChange(yearId);
    }
  };

  return (
    <div className="space-y-2">
      {years.map((year) => (
        <motion.button
          key={year.id}
          onClick={() => handleYearClick(year.id)}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors
            ${
              activeYear === year.id
                ? 'bg-blue-500 text-white dark:bg-blue-600'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {year.name}
        </motion.button>
      ))}
    </div>
  );
};

export default YearFilter; 