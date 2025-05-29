# Personal Website - fyang0507.github.io

A modern, responsive personal website built with React, TypeScript, and Vite. Features a bilingual blog system, interactive photo gallery, and optimized performance.

## 🚀 Features

### Blog System
- **Bilingual Support**: English and Chinese content with seamless language switching
- **Markdown-based**: Write posts in Markdown with frontmatter metadata
- **Advanced Filtering**: Filter by tags and years with dynamic counts
- **Subtitle Support**: Optional subtitles for enhanced post descriptions
- **Auto-generated Excerpts**: Smart excerpt generation for both languages
- **Reading Time Estimation**: Automatic calculation based on content length
- **Cover Images**: Local image support with optimized loading

### Photo Gallery
- **Masonry Layout**: Beautiful responsive grid with optimized performance
- **Lightbox Viewer**: Full-screen image viewing with navigation
- **Smart Filtering**: Category and year filters with dynamic counts
- **Randomization**: Default random order with date sorting option
- **Performance Optimized**: Pagination, lazy loading, and hardware acceleration
- **Hover Effects**: Smooth zoom animations with GPU acceleration

### Technical Features
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimized**: Code splitting, lazy loading, and optimized builds
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Type Safety**: Full TypeScript implementation
- **Modern Tooling**: Vite for fast development and optimized builds

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: Gray Matter for frontmatter parsing
- **Deployment**: GitHub Pages with GitHub Actions

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Navbar, Footer, etc.)
│   ├── blog/            # Blog-specific components
│   ├── gallery/         # Gallery-specific components
│   └── home/            # Home page components
├── pages/               # Route components
├── context/             # React context providers
├── data/                # Data processing and utilities
├── markdown/posts/      # Blog post markdown files
├── types/               # TypeScript type definitions
└── index.css           # Global styles and Tailwind imports

public/
└── images/
    ├── blog/covers/     # Blog post cover images
    └── gallery/         # Gallery images

docs/                    # Build output (GitHub Pages)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fyang0507/fyang0507.github.io.git
   cd fyang0507.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 📝 Content Management

### Adding Blog Posts

1. **Create markdown file** in `src/markdown/posts/`
   ```
   YYYY-MM-DD_post-title.md
   ```

2. **Add frontmatter**
   ```yaml
   ---
   title: 'Your Post Title'
   subtitle: 'Optional subtitle'
   coverImage: '/images/blog/covers/your-image.jpg'
   date: '2024-01-15'
   tags: ['tag1', 'tag2']
   languages: ['en', 'zh']
   title_zh: '中文标题'
   subtitle_zh: '中文副标题'
   tags_zh: ['标签1', '标签2']
   ---
   ```

3. **Write content**
   ```markdown
   Your English content here...
   
   ---zh---
   
   你的中文内容...
   ```

4. **Add cover image** to `public/images/blog/covers/`

### Adding Gallery Images

1. **Add images** to `public/images/gallery/`
2. **Update** `src/data/photos.ts` with image metadata
3. **Include** title, category, date, and description

## 🚀 Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Automatic Deployment Process:
1. Push changes to `main` branch
2. GitHub Actions builds the site
3. Generated files are deployed to `gh-pages` branch
4. Site is live at `https://fyang0507.github.io`

### Manual Build:
```bash
npm run build
```

The built files will be in the `docs/` directory.

## 🎨 Customization

### Themes
- Modify `src/context/ThemeContext.tsx` for theme logic
- Update Tailwind classes for color schemes
- Customize CSS variables in `src/index.css`

### Styling
- All styles use Tailwind CSS
- Custom components in `src/components/`
- Global styles in `src/index.css`

### Content
- Blog posts: `src/markdown/posts/`
- Gallery images: `public/images/gallery/`
- Site metadata: Update in component files

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [Blog Subtitles Guide](BLOG_SUBTITLES_GUIDE.md)
- [Blog Year Filter Guide](BLOG_YEAR_FILTER_GUIDE.md)
- [Cover Images Guide](COVER_IMAGES_GUIDE.md)
- [Gallery Features](GALLERY_FEATURES.md)
- [Gallery Performance Optimizations](GALLERY_PERFORMANCE_OPTIMIZATIONS.md)
- [Gallery Randomization Guide](GALLERY_RANDOMIZATION_GUIDE.md)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Site**: [https://fyang0507.github.io](https://fyang0507.github.io)
- **Repository**: [https://github.com/fyang0507/fyang0507.github.io](https://github.com/fyang0507/fyang0507.github.io)

---

Built with ❤️ using React, TypeScript, and modern web technologies.
