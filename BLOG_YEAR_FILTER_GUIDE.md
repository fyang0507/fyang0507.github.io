# Blog Year Filter Feature

## Overview

The blog now supports year-based filtering in addition to the existing tag filtering. This feature allows users to view posts from specific years or browse all posts chronologically, similar to the gallery's year filtering functionality.

## Features

1. **Year Filter Component**: A new `YearFilter` component specifically for the blog section that displays available years as clickable buttons
2. **Combined Filtering**: Users can filter by both tags and year simultaneously
3. **Dynamic Year Extraction**: Years are automatically extracted from blog post dates and sorted in descending order (newest first)
4. **Clear Filters**: A "Clear All Filters" button to reset both tag and year filters
5. **Results Counter**: Shows the number of posts currently displayed with filter context
6. **Empty State**: Displays a helpful message when no posts match the current filters

## Implementation Details

### Files Modified/Created:

1. **`src/components/blog/YearFilter.tsx`** (New):
   - Similar interface to the gallery's `YearFilter` but with blog-specific styling
   - Uses blue color scheme to differentiate from gallery filters (which use emerald)
   - Responsive design with horizontal scrolling on mobile
   - Framer Motion animations for smooth interactions

2. **`src/data/posts.ts`**:
   - Added `getUniqueYears()` function to extract unique years from blog post dates
   - Added `postYears` export for use in components
   - Years are sorted in descending order (newest first)

3. **`src/pages/BlogPage.tsx`**:
   - Added `activeYear` state management
   - Updated filtering logic to handle both tag and year filters
   - Reorganized sidebar to include both year and tag filters with clear sections
   - Added results counter showing filtered post count
   - Enhanced empty state handling with combined filter reset

### Usage

Users can now:
- Filter posts by tags (existing functionality)
- Filter posts by year (All Years, plus individual years based on available posts)
- Use both filters together (e.g., "travel log posts from 2018")
- Clear all filters with a single click
- See how many posts match their current filter selection

### Technical Notes

- Years are extracted using `new Date(post.date).getFullYear()`
- Filtering is performed client-side for optimal performance
- The year filter automatically updates when new posts with different years are added
- Both filters use consistent visual design patterns
- All animations and interactions are preserved from the original blog experience
- The year filter uses a blue color scheme to distinguish it from tag filters

### Filter Layout

The sidebar now contains:
1. **Clear All Filters** button (appears when any filters are active)
2. **Filter by Year** section with year buttons
3. **Filter by Tags** section with tag cloud

### Color Scheme

- **Year Filter**: Blue (`bg-blue-500`) when active
- **Tag Filter**: Primary color (maintains existing styling)
- **Clear Filters**: Primary color for consistency

### Sample Data

The year filter will automatically populate based on the dates of existing blog posts. For example, if you have posts from 2015, 2016, 2017, 2018, and 2021, the filter will show:
- All Years
- 2021
- 2018
- 2017
- 2016
- 2015

This provides an intuitive way to browse posts chronologically and discover content from specific time periods.

## Benefits

1. **Improved Navigation**: Users can easily find posts from specific years
2. **Better Content Discovery**: Chronological browsing helps users explore the evolution of content over time
3. **Enhanced User Experience**: Combined with tag filtering, provides powerful content filtering capabilities
4. **Consistent Design**: Matches the gallery's filtering pattern for a cohesive user experience
5. **Responsive Design**: Works well on both desktop and mobile devices 