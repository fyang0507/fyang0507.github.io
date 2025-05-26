import { BlogPost } from '../types';
import matter from 'gray-matter';

// Function to sanitize title for ID generation
const sanitizeTitleForId = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
};

// Vite's glob import to get all markdown files
const markdownFiles = import.meta.glob('/src/markdown/posts/*.md', { eager: true, as: 'raw' });

const processedPosts: BlogPost[] = Object.entries(markdownFiles).map(([path, rawContent]) => {
  try {
    const { data: frontmatter, content: markdownBody } = matter(rawContent);

    // Validate required frontmatter fields
    const requiredFields = ['title', 'excerpt', 'coverImage', 'date', 'tags'];
    const missingFields = requiredFields.filter(field => !(field in frontmatter));

    if (missingFields.length > 0) {
      console.error(`Error: Missing frontmatter field(s) "${missingFields.join(', ')}" in file ${path}. Skipping post.`);
      return null; // Skip this post
    }

    // Type assertion for frontmatter (including bilingual fields)
    const fm = frontmatter as {
      title: string;
      excerpt: string;
      coverImage: string;
      date: string; // Assuming YYYY-MM-DD format
      tags: string[];
      // Bilingual fields
      title_zh?: string;
      excerpt_zh?: string;
      tags_zh?: string[];
      languages?: string[];
    };

    if (!fm.title || typeof fm.title !== 'string') {
      console.error(`Error: Invalid or missing 'title' in file ${path}. Skipping post.`);
      return null;
    }
    if (!fm.date || typeof fm.date !== 'string') {
      console.error(`Error: Invalid or missing 'date' in file ${path}. Skipping post.`);
      return null;
    }
    if (!fm.excerpt || typeof fm.excerpt !== 'string') {
      console.error(`Error: Invalid or missing 'excerpt' in file ${path}. Skipping post.`);
      return null;
    }
    if (!fm.coverImage || typeof fm.coverImage !== 'string') {
      console.error(`Error: Invalid or missing 'coverImage' in file ${path}. Skipping post.`);
      return null;
    }
    if (!fm.tags || !Array.isArray(fm.tags) || !fm.tags.every(tag => typeof tag === 'string')) {
      console.error(`Error: Invalid or missing 'tags' in file ${path}. Skipping post.`);
      return null;
    }

    // Split content by Chinese delimiter
    const contentParts = markdownBody.split('---zh---');
    const englishContent = contentParts[0].trim();
    const chineseContent = contentParts[1]?.trim() || null;

    // Check if post is multilingual
    const isMultilingual = fm.languages && fm.languages.length > 1;

    const id = `${fm.date}_${sanitizeTitleForId(fm.title)}`;
    const wordCount = englishContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      id,
      title: fm.title,
      excerpt: fm.excerpt,
      content: englishContent, // Store the English content
      coverImage: fm.coverImage,
      date: fm.date,
      tags: fm.tags,
      readingTime,
      // Bilingual fields
      isMultilingual,
      title_zh: fm.title_zh,
      excerpt_zh: fm.excerpt_zh,
      content_zh: chineseContent,
      tags_zh: fm.tags_zh,
      languages: fm.languages,
    };
  } catch (e) {
    console.error(`Error processing file ${path}:`, e);
    return null; // Skip this post in case of parsing errors
  }
}).filter(post => post !== null) as BlogPost[]; // Filter out nulls and assert type

// Sort posts by date in descending order (newest first)
processedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const postsWithReadingTime: BlogPost[] = processedPosts;

// Optionally, if you need a plain 'posts' array without readingTime for some reason:
// export const posts: Omit<BlogPost, 'readingTime'>[] = processedPosts.map(({ readingTime, ...rest }) => rest);