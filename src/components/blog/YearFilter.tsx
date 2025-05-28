import React from 'react';
import { motion } from 'framer-motion';

interface Year {
  id: string;
  name: string;
  count: number;
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
  return (
    <div className="space-y-2 p-1">
      {years.map((year) => (
        <motion.button
          key={year.id}
          onClick={() => onYearChange(year.id)}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors flex items-center justify-between
            ${
              activeYear === year.id
                ? 'bg-blue-500 text-white dark:bg-blue-600'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          style={{ transformOrigin: 'center' }}
        >
          <span>{year.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeYear === year.id
              ? 'bg-white/20 text-white'
              : 'bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
          }`}>
            {year.count}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default YearFilter; 