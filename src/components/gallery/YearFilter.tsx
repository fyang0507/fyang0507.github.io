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
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-3 px-1 py-1">
        {years.map((year) => (
          <motion.button
            key={year.id}
            onClick={() => onYearChange(year.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5
              ${
                activeYear === year.id
                  ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
    </div>
  );
};

export default YearFilter; 