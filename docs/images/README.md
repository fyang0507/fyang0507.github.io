# Image Assets

This directory contains static image assets for the website.

## Directory Structure

```
public/images/
├── blog/
│   └── covers/          # Cover images for blog posts
├── gallery/             # Gallery images (if moving from external URLs)
└── README.md           # This file
```

## Usage

### Blog Cover Images

Place blog cover images in `public/images/blog/covers/` and reference them in your markdown frontmatter like:

```yaml
coverImage: '/images/blog/covers/your-image.jpg'
```

### File Naming Convention

For blog covers, consider using a naming convention that matches your blog post files:
- `2015-05-12_复活随笔.jpg` (matches the post filename)
- Or use descriptive names: `resurrection-essay-cover.jpg`

### Supported Formats

- `.jpg` / `.jpeg` - For photographs and complex images
- `.png` - For images with transparency or simple graphics
- `.webp` - For modern browsers (smaller file sizes)

### Image Optimization

Consider optimizing images before adding them:
- Resize to appropriate dimensions (typically 1200px wide for covers)
- Compress to reduce file size while maintaining quality
- Use tools like ImageOptim, TinyPNG, or similar

## Notes

- Images in this directory will be copied to the build output (`docs/`) during the build process
- Reference images with absolute paths starting with `/images/...`
- Vite will handle the copying and serving of these assets automatically 