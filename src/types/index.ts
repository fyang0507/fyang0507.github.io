export interface Photo {
  id: string;
  location: string;
  imageUrl: string;
  category: string;
  date: string;
  aspectRatio?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  tags: string[];
  readingTime?: number;
  // Bilingual support
  isMultilingual?: boolean;
  title_zh?: string;
  subtitle_zh?: string;
  excerpt_zh?: string;
  content_zh?: string;
  tags_zh?: string[];
  languages?: string[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}