import React, { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface SocialLinkProps {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, ariaLabel, children }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 
              hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 
              transition-all duration-300 hover:scale-110 hover:no-underline"
  >
    {children}
  </a>
);

interface WeChatQRLinkProps {
  iconSize: number;
}

const WeChatQRLink: React.FC<WeChatQRLinkProps> = ({ iconSize }) => {
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Detect if device is mobile/touch
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Handle click outside to close QR code
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowQR(false);
      }
    };

    if (showQR) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQR]);

  const handleInteraction = () => {
    if (isMobile) {
      setShowQR(!showQR);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowQR(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowQR(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleInteraction}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="WeChat QR Code"
        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 
                  hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 
                  transition-all duration-300 hover:scale-110 relative"
      >
        <img 
          src={theme === 'dark' ? "/images/wechat-icon-dark.png" : "/images/wechat-icon-light.png"}
          alt="WeChat" 
          width={iconSize} 
          height={iconSize}
          className="object-contain"
        />
        
        {/* QR indicator - visible on all devices */}
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full text-[8px] 
                        flex items-center justify-center text-white font-bold shadow-md border-2 border-white dark:border-slate-800
                        transition-all duration-300">
          QR
        </span>
      </button>

      {/* QR Code Tooltip */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 flex justify-center mb-3 z-50"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 relative">
              {/* Arrow pointing down - centered */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                            border-l-4 border-r-4 border-t-4 border-transparent 
                            border-t-white dark:border-t-slate-800"></div>
              
              <div className="text-center">
                <img 
                  src="/images/wechat-qr.jpg" 
                  alt="WeChat QR Code" 
                  className="w-32 h-32 object-contain rounded-md mb-2"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.textContent = 'QR Code not found';
                  }}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  微信公众号
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
                  Scan with WeChat
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SocialLinksProps {
  className?: string;
  iconSize?: number;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ className = '', iconSize = 20 }) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <SocialLink href="https://github.com/fyang0507" ariaLabel="GitHub">
        <Github size={iconSize} />
      </SocialLink>
      <SocialLink href="https://www.linkedin.com/in/runtong-yang/" ariaLabel="LinkedIn">
        <Linkedin size={iconSize} />
      </SocialLink>
      <SocialLink href="https://www.instagram.com/yangruntong/" ariaLabel="Instagram">
        <Instagram size={iconSize} />
      </SocialLink>
      <SocialLink href="mailto:fredyang0507@gmail.com" ariaLabel="Email">
        <Mail size={iconSize} />
      </SocialLink>
      <WeChatQRLink iconSize={iconSize} />
    </div>
  );
};

export default SocialLinks;