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
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-2">
        {years.map((year) => (
          <motion.button
            key={year.id}
            onClick={() => onYearChange(year.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${
                activeYear === year.id
                  ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {year.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default YearFilter; 