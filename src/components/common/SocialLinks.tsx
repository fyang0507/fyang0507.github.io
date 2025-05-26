import React from 'react';
import { Github, Linkedin, Twitter, Instagram, Mail } from 'lucide-react';

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

interface SocialLinksProps {
  className?: string;
  iconSize?: number;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ className = '', iconSize = 20 }) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <SocialLink href="https://github.com" ariaLabel="GitHub">
        <Github size={iconSize} />
      </SocialLink>
      <SocialLink href="https://www.linkedin.com/in/runtong-yang/" ariaLabel="LinkedIn">
        <Linkedin size={iconSize} />
      </SocialLink>
      {/* TODO: replace with WeChat */}
      <SocialLink href="https://twitter.com" ariaLabel="Twitter">
        <Twitter size={iconSize} /> 
      </SocialLink>
      <SocialLink href="https://www.instagram.com/yangruntong/" ariaLabel="Instagram">
        <Instagram size={iconSize} />
      </SocialLink>
      <SocialLink href="mailto:fredyang0507@gmail.com" ariaLabel="Email">
        <Mail size={iconSize} />
      </SocialLink>
    </div>
  );
};

export default SocialLinks;