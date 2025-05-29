# Gallery Features

## Year Filtering

The gallery now supports filtering by year in addition to the existing category filtering. This feature allows users to view photos from specific years or browse all photos chronologically.

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
   - Added `getUniqueCategories()` function with dynamic counting and sorting
   - Contains 96 photos spanning from 2015 to 2025

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
- Filter photos by category (All, Landscape, Cityscape, Architecture, People, Street, Creature, Black and White, Abstract)
- Filter photos by year (All Years, 2025, 2024, 2023, 2022, 2021, 2019, 2018, 2016, 2015)
- Use both filters together (e.g., "Landscape photos from 2024")
- Clear all filters with a single click
- See how many photos match their current filter selection

### Current Categories

The gallery includes the following photo categories (sorted by frequency):
- **Landscape**: Nature scenes, mountains, water bodies
- **Cityscape**: Urban environments and skylines
- **Architecture**: Buildings, structures, and architectural details
- **People**: Portraits and human subjects
- **Street**: Street photography and urban life
- **Creature**: Animals, plants, and living subjects
- **Black and White**: Monochrome photography
- **Abstract**: Abstract compositions and artistic interpretations

### Technical Notes

- Years are extracted using `new Date(photo.date).getFullYear()`
- Filtering is performed client-side for optimal performance
- The year filter automatically updates when new photos with different years are added
- Both filters use the same visual design pattern for consistency
- All animations and interactions are preserved from the original gallery experience
- Categories are dynamically sorted by photo count (most popular first)

### Current Data

The gallery now includes photos from:
- **2025**: 2 photos (Hawaii landscapes)
- **2024**: 20 photos (Seoul, Europe travel, Northern lights)
- **2023**: 15 photos (Various locations)
- **2022**: 8 photos (Travel and urban scenes)
- **2021**: 25 photos (East Coast US travel)
- **2019**: 8 photos (New York, Canada)
- **2018**: 8 photos (International travel)
- **2016**: 2 photos (Tokyo, Japan)
- **2015**: 8 photos (Europe travel)

This provides comprehensive coverage across multiple years and demonstrates the year filtering functionality effectively. 