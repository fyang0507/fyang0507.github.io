import React from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 py-12 mt-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-bold mb-4">Fred Yang</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Where Computational Intelligence Meets Creative Vision.
            </p>
            <SocialLinks />
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-300">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-300">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="text-slate-600 dark:text-slate-400">
                Email: fredyang0507@gmail.com
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Location: New York, NY
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>© {currentYear} Your Name. All rights reserved.</p>
          <p className="flex flex-wrap items-center justify-center">
            Developed with {'\u00A0'}
            <a
              href="https://cursor.sh/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-300 hover:underline inline-flex items-center"
            >
              <img src="https://www.cursor.com/assets/images/logo.svg" alt="Cursor Logo" className="h-4 w-4 mr-1" />
              Cursor
            </a>
            {'\u00A0'} and {'\u00A0'}
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-300 hover:underline inline-flex items-center"
            >
              <img src="https://pbs.twimg.com/profile_images/1880702021122342912/fe9TlQqJ_400x400.jpg" alt="Bolt Logo" className="h-4 w-4 mr-1" />
              Bolt
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;