# Blog Subtitles Guide

This guide explains how to use the optional subtitle feature in your blog posts.

## Overview

The blog system now supports optional subtitles for all blog posts. Subtitles appear below the main title and provide additional context or clarification about the post content. They support both English and Chinese languages for multilingual posts.

## Adding Subtitles to Blog Posts

### Frontmatter Fields

Add the following optional fields to your markdown file's frontmatter:

```yaml
---
title: 'Your Main Title'
subtitle: 'Your optional English subtitle'  # Optional
title_zh: '你的中文标题'
subtitle_zh: '你的可选中文副标题'  # Optional
# ... other frontmatter fields
---
```

### Field Descriptions

- **`subtitle`** (optional): English subtitle that appears below the main English title
- **`subtitle_zh`** (optional): Chinese subtitle that appears below the main Chinese title

### Example Frontmatter

```yaml
---
title: 'The Art of Street Photography'
subtitle: 'Capturing Life in Motion'
excerpt: 'Exploring techniques and philosophy behind street photography...'
title_zh: '街头摄影的艺术'
subtitle_zh: '捕捉生活中的动态瞬间'
excerpt_zh: '探索街头摄影背后的技巧和哲学...'
coverImage: '/images/blog/covers/street-photography.jpg'
date: '2024-01-15'
tags: ['photography', 'street', 'art']
tags_zh: ['摄影', '街头', '艺术']
languages: ['en', 'zh']
---
```

## How Subtitles Are Displayed

### Blog List Pages

- **Chinese posts**: Subtitles appear in larger, italic text below the title
- **English posts**: Subtitles appear in medium-sized, italic text below the title
- **Multilingual posts**: Both subtitles are shown with appropriate styling

### Individual Blog Post Pages

- Subtitles appear prominently below the main title
- They are styled in italic text with appropriate color contrast
- Language switching preserves subtitle display for the selected language

### Featured Posts (Home Page)

- Subtitles are displayed in the featured posts section
- They maintain consistent styling with the overall design

## Styling Details

### Visual Hierarchy

1. **Main Title**: Largest, bold text
2. **Subtitle**: Medium-sized, italic text with muted color
3. **Excerpt**: Smaller text for content preview

### Color Scheme

- **Light mode**: Subtitles use `text-slate-600` for good contrast
- **Dark mode**: Subtitles use `text-slate-400` for optimal readability

### Typography

- Subtitles use italic styling to differentiate from main titles
- Font sizes are responsive and scale appropriately across devices

## Best Practices

### When to Use Subtitles

1. **Clarification**: When the main title needs additional context
2. **Series Posts**: To indicate part numbers or themes
3. **Technical Posts**: To specify the focus or scope
4. **Creative Posts**: To add poetic or descriptive elements

### Writing Guidelines

1. **Keep it concise**: Subtitles should be brief and to the point
2. **Complement the title**: Don't repeat information from the main title
3. **Add value**: Provide additional context or intrigue
4. **Maintain consistency**: Use similar style across your posts

### Examples of Good Subtitles

```yaml
# Technical post
title: 'Understanding React Hooks'
subtitle: 'A Deep Dive into useState and useEffect'

# Travel post
title: 'Journey Through Patagonia'
subtitle: 'Where Mountains Meet the Sky'

# Series post
title: 'Photography Fundamentals'
subtitle: 'Part 1: Understanding Light'

# Philosophical post
title: 'The Silence of Lies'
subtitle: 'Reflections on Truth and Memory'
```

## Migration Notes

### Existing Posts

- All existing posts will continue to work without modification
- Subtitles are completely optional - posts without them display normally
- You can add subtitles to existing posts by editing their frontmatter

### Backward Compatibility

- The system maintains full backward compatibility
- Posts without subtitle fields are handled gracefully
- No breaking changes to existing functionality

## Technical Implementation

### Type Safety

The `BlogPost` interface includes optional subtitle fields:

```typescript
interface BlogPost {
  // ... existing fields
  subtitle?: string;
  subtitle_zh?: string;
  // ... other fields
}
```

### Data Processing

- Subtitles are extracted from frontmatter during build time
- They're included in the processed post data
- Language switching logic handles subtitle display appropriately

### Component Updates

All blog-related components have been updated to support subtitles:

- `BlogPage.tsx`: Blog listing page
- `BlogPost.tsx`: Individual post page
- `FeaturedPosts.tsx`: Home page featured posts

## Troubleshooting

### Common Issues

1. **Subtitle not appearing**: Check frontmatter syntax and field names
2. **Styling issues**: Ensure you're using the correct field names (`subtitle` and `subtitle_zh`)
3. **Language switching**: Verify both language versions have appropriate subtitles

### Validation

The system validates frontmatter fields and will log errors for:
- Invalid YAML syntax
- Missing required fields
- Incorrect data types

## Future Enhancements

Potential future improvements:
- Rich text formatting in subtitles
- Subtitle length validation
- SEO optimization for subtitles
- Additional styling options

---

For questions or issues with the subtitle feature, please refer to the main project documentation or create an issue in the repository. 