# Photography Gallery Features

## Year Filtering

The photography gallery now supports filtering by year in addition to the existing category filtering. This feature allows users to view photos from specific years or browse all photos chronologically.

### Features

1. **Year Filter Component**: A new `YearFilter` component that displays available years as clickable buttons
2. **Combined Filtering**: Users can filter by both category and year simultaneously
3. **Dynamic Year Extraction**: Years are automatically extracted from photo dates and sorted in descending order (newest first)
4. **Clear Filters**: A "Clear All Filters" button to reset both category and year filters
5. **Results Counter**: Shows the number of photos currently displayed with filter context
6. **Empty State**: Displays a helpful message when no photos match the current filters

### Implementation Details

#### Files Modified/Created:

1. **`src/data/photos.ts`**:
   - Added `getUniqueYears()` function to extract unique years from photo dates
   - Added `photoYears` export for use in components
   - Added sample photos from different years (2022, 2023, 2024)

2. **`src/components/gallery/YearFilter.tsx`** (New):
   - Similar interface to `CategoryFilter` but for year selection
   - Uses emerald color scheme to differentiate from category filters
   - Responsive design with horizontal scrolling on mobile

3. **`src/pages/GalleryPage.tsx`**:
   - Added `activeYear` state management
   - Updated filtering logic to handle both category and year filters
   - Added filter section with clear organization
   - Added results counter and empty state handling

### Usage

Users can now:
- Filter photos by category (All, Landscape, Architecture, Portrait, Street, Abstract, Wildlife)
- Filter photos by year (All Years, 2024, 2023, 2022)
- Use both filters together (e.g., "Landscape photos from 2023")
- Clear all filters with a single click
- See how many photos match their current filter selection

### Technical Notes

- Years are extracted using `new Date(photo.date).getFullYear()`
- Filtering is performed client-side for optimal performance
- The year filter automatically updates when new photos with different years are added
- Both filters use the same visual design pattern for consistency
- All animations and interactions are preserved from the original gallery experience

### Sample Data

The gallery now includes photos from:
- **2024**: 2 photos (Desert Sunset, Modern Portrait)
- **2023**: 10 photos (original sample data)
- **2022**: 3 photos (Golden Hour Landscape, Vintage Street Scene, Industrial Abstract)

This provides a good demonstration of the year filtering functionality across multiple years. 