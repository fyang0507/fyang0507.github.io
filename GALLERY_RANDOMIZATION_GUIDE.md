# Gallery Randomization and Enhanced Filtering Features

## Overview

The gallery now supports randomized and date-sorted viewing modes, dynamic photo counts, and intelligent category sorting based on photo frequency.

## Features

### 1. **Default Randomized View**
- Gallery initially displays photos in a truly randomized order
- Uses Fisher-Yates shuffle algorithm for proper randomization
- Randomization is consistent during the session (photos don't re-shuffle on filter changes)

### 2. **Sort Toggle Button**
- Located after the year filter section
- Two modes available:
  - **Random**: Shows photos in randomized order
  - **Date**: Shows photos sorted by date (newest first)

### 3. **Dynamic Photo Counts**
- All filter buttons display the number of photos in each category/year
- Counts update dynamically based on active filters
- Category counts reflect current year filter
- Year counts reflect current category filter

### 4. **Smart Category Sorting**
- Categories are sorted by photo count (descending order)
- Most popular categories appear first
- Helps users discover the most represented content types

### 5. **Persistent Randomization**
- Random order is memoized and remains consistent throughout the session
- Filtering by category or year maintains the same random order
- Only recalculates randomization when the page is refreshed

## Implementation Details

### Files Modified/Created:

1. **`src/components/gallery/SortButton.tsx`** (New):
   - Toggle button component with Random/Date modes
   - Uses Shuffle and Calendar icons from Lucide React
   - Styled with motion animations and dark mode support

2. **`src/components/gallery/CategoryFilter.tsx`**:
   - Updated interface to include `count` property
   - Added photo count badges to each category button
   - Responsive count styling for active/inactive states

3. **`src/components/gallery/YearFilter.tsx`**:
   - Updated interface to include `count` property
   - Added photo count badges to each year button
   - Consistent styling with category filters

4. **`src/data/photos.ts`**:
   - Updated `getUniqueCategories()` to include counts and sort by frequency
   - Updated `getUniqueYears()` to include counts
   - Both functions now return objects with `id`, `name`, and `count` properties

5. **`src/pages/GalleryPage.tsx`**:
   - Added dynamic category and year calculation with `useMemo`
   - Implemented cross-filter counting (categories update based on year filter, and vice versa)
   - Removed static imports in favor of dynamic calculation
   - Added sort mode indicator in results counter

### Technical Implementation:

```typescript
// Dynamic categories with counts based on current year filter
const dynamicCategories = useMemo(() => {
  let photosToCount = photos;
  
  // If year filter is active, only count photos from that year
  if (activeYear !== 'all') {
    photosToCount = photos.filter(photo => 
      new Date(photo.date).getFullYear().toString() === activeYear
    );
  }
  
  // Count photos per category and sort by count (descending)
  const categoryCounts = photosToCount.reduce((acc, photo) => {
    acc[photo.category] = (acc[photo.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .map(([category, count]) => ({ 
      id: category, 
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count
    }));
  
  return [
    { id: 'all', name: 'All', count: photosToCount.length },
    ...categories
  ];
}, [activeYear]);
```

## User Experience

### Default Behavior:
- Gallery loads with photos in random order
- Categories sorted by popularity (most photos first)
- All filters show photo counts
- Sort button shows "Random" as active

### Dynamic Filtering:
- Selecting a year updates category counts to show only photos from that year
- Selecting a category updates year counts to show only photos from that category
- Counts provide immediate feedback on filter combinations

### Filter Button Design:
- Each button shows: `Category Name (Count)`
- Count badges have different styling for active/inactive states
- Responsive design maintains readability on all screen sizes

## Benefits

1. **Discovery**: Random mode helps users discover older photos
2. **Transparency**: Photo counts provide clear filtering feedback
3. **Efficiency**: Most popular categories are shown first
4. **Intelligence**: Cross-filter counting helps users understand data relationships
5. **Performance**: Memoized calculations prevent unnecessary recalculation
6. **Consistency**: Random order remains stable during filtering operations

## Future Enhancements

Potential improvements could include:
- Save sort preference in localStorage
- Add more sorting options (alphabetical, category-based)
- Implement "shuffle again" functionality for new random order
- Add transition animations when counts update
- Consider adding percentage indicators alongside counts 