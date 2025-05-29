# Cover Images Migration Guide

## Overview

This guide explains how to migrate from external cover images (like Pexels URLs) to local cover images stored in your project.

## Directory Structure

```
public/
└── images/
    └── blog/
        └── covers/          # Blog post cover images
            ├── .gitkeep     # Ensures directory is tracked by git
            └── README.md    # Documentation
```

## How Cover Images Work

Cover images are specified in the frontmatter of your markdown blog posts and are used in multiple places:

1. **Individual blog post pages** - Main cover image at the top
2. **Blog listing page** - Thumbnails in post cards  
3. **Home page featured posts** - Thumbnails in the recent articles section
4. **Related posts** - Thumbnails in the related posts section

## Migration Process

### Step 1: Add Your Image Files

Place your cover images in `public/images/blog/covers/`. Recommended naming conventions:

- **Match post filename**: `2015-05-12_复活随笔.jpg`
- **Descriptive names**: `resurrection-essay-cover.jpg`
- **Date-based**: `2015-05-12-resurrection.jpg`

### Step 2: Update Frontmatter

Change the `coverImage` field in your markdown files from external URLs to local paths:

**Before:**
```yaml
coverImage: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg'
```

**After:**
```yaml
coverImage: '/images/blog/covers/your-image.jpg'
```

### Step 3: Image Specifications

**Recommended dimensions:**
- **Width**: 1200px (minimum), 1920px (optimal)
- **Height**: 630-800px (maintains good aspect ratio)
- **Aspect ratio**: 16:9 or 3:2 works well
- **Format**: JPG for photos, PNG for graphics with transparency, WebP for modern browsers

**File size optimization:**
- Target 100-300KB for good balance of quality and loading speed
- Use tools like ImageOptim, TinyPNG, or Squoosh.app

## Example Migration

Here's how the "复活随笔" post was updated:

**Original:**
```yaml
coverImage: ''
```

**Updated:**
```yaml
coverImage: '/images/blog/covers/2015-05-12_复活随笔.jpg'
```

## Current Blog Posts Status

Based on the existing posts in `src/markdown/posts/`, here are all the current blog posts with their cover image status:

### ✅ **Posts with Cover Images** (Already migrated):
1. **2025-03-23_夏威夷没有愤怒.md** - ✅ Has cover image
2. **2024-12-18_我们生活的故事04.md** - ✅ Has cover image
3. **2024-10-23_那些看似无辜的.md** - ✅ Has cover image
4. **2024-04-23_香港森林.md** - ✅ Has cover image
5. **2023-12-28_我们生活的故事03.md** - ✅ Has cover image
6. **2023-05-27_三城记.md** - ✅ Has cover image
7. **2022-11-27_我们生活的故事02.md** - ✅ Has cover image
8. **2021-11-28_我们生活的故事01.md** - ✅ Has cover image
9. **2019-12-29_救赎山.md** - ✅ Has cover image
10. **2019-12-02_被许诺和被荒芜的.md** - ✅ Has cover image
11. **2019-01-09_他和他的猫.md** - ✅ Has cover image
12. **2018-12-28_加州打卡.md** - ✅ Has cover image
13. **2018-10-20_纽约层积.md** - ✅ Has cover image
14. **2018-03-15_流与逆流.md** - ✅ Has cover image
15. **2017-12-02_社会人.md** - ✅ Has cover image
16. **2017-05-01_巡礼之年.md** - ✅ Has cover image
17. **2016-08-10_片道东瀛.md** - ✅ Has cover image
18. **2015-05-17_巴黎的呼吸.md** - ✅ Has cover image
19. **2015-06-13_为什么是阿赫兰.md** - ✅ Has cover image
20. **2015-05-09_到南方去.md** - ✅ Has cover image

### ⚠️ **Posts with Potential Issues**:
1. **2015-04-12_复活随笔.md** - Has cover image `2015-05-12_复活随笔.jpg` (date mismatch)

**Note**: All posts appear to have corresponding cover images in the `public/images/blog/covers/` directory. The migration to local images has been completed successfully.

## Benefits of Local Images

1. **Performance**: No external requests, faster loading
2. **Reliability**: No broken links if external services change
3. **Control**: Full control over image quality and optimization
4. **Offline development**: Works without internet connection
5. **Consistency**: Uniform image treatment and optimization

## Build Process

When you run `npm run build`, Vite will:
1. Copy all files from `public/` to the `docs/` directory
2. Your images will be available at `/images/blog/covers/...`
3. The paths in your markdown frontmatter will resolve correctly

## Testing

After adding images and updating frontmatter:

1. **Development**: Run `npm run dev` and check that images load correctly
2. **Build**: Run `npm run build` and verify images are copied to `docs/images/`
3. **Check all contexts**: Verify images appear correctly in:
   - Individual blog posts
   - Blog listing page
   - Home page featured posts
   - Related posts sections

## Tips

- **Batch processing**: Use tools like ImageMagick or Photoshop actions to resize multiple images at once
- **Consistent style**: Consider applying consistent filters or treatments for visual cohesion
- **Alt text**: The image alt text is automatically set to the post title
- **Responsive**: The CSS already handles responsive display of cover images
- **Dark mode**: Consider how images look in both light and dark themes

## Fallback Handling

If a cover image fails to load, the current CSS will gracefully handle it. However, it's good practice to:
1. Always test image paths
2. Use optimized images to prevent loading issues
3. Consider adding a default fallback image if needed 