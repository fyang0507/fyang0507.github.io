import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Check if current route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-dark/95 backdrop-blur-sm shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-xl md:text-2xl font-bold no-underline text-slate-900 dark:text-white hover:no-underline"
        >
          Fred Yang
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`no-underline text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:no-underline transition-colors ${
              isActive('/') ? 'text-primary-600 dark:text-primary-400 font-medium' : ''
            }`}
          >
            Home
          </Link>
          <Link 
            to="/gallery" 
            className={`no-underline text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:no-underline transition-colors ${
              isActive('/gallery') ? 'text-primary-600 dark:text-primary-400 font-medium' : ''
            }`}
          >
            Gallery
          </Link>
          <Link 
            to="/blog" 
            className={`no-underline text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 hover:no-underline transition-colors ${
              isActive('/blog') ? 'text-primary-600 dark:text-primary-400 font-medium' : ''
            }`}
          >
            Blog
          </Link>
          <button 
            onClick={toggleTheme} 
            className="text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-4">
          <button 
            onClick={toggleTheme} 
            className="text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-700 dark:text-slate-300 p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-800 shadow-lg py-4 px-4 flex flex-col space-y-4 animate-fade-in">
          <Link 
            to="/" 
            className={`py-2 px-4 rounded-md no-underline hover:no-underline ${
              isActive('/') 
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 font-medium' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/gallery" 
            className={`py-2 px-4 rounded-md no-underline hover:no-underline ${
              isActive('/gallery') 
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 font-medium' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Gallery
          </Link>
          <Link 
            to="/blog" 
            className={`py-2 px-4 rounded-md no-underline hover:no-underline ${
              isActive('/blog') 
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 font-medium' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Blog
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;