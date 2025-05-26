export interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
  aspectRatio?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  tags: string[];
  readingTime?: number;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}