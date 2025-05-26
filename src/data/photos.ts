import { Photo } from '../types';

// Sample data for the photography gallery
export const photos: Photo[] = [
  {
    id: '1',
    title: 'Mountain Sunrise',
    description: 'A beautiful sunrise over mountain peaks',
    imageUrl: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
    category: 'landscape',
    date: '2023-05-15',
  },
  {
    id: '2',
    title: 'Urban Architecture',
    description: 'Modern architecture in downtown',
    imageUrl: 'https://images.pexels.com/photos/1823681/pexels-photo-1823681.jpeg',
    category: 'architecture',
    date: '2023-06-22',
  },
  {
    id: '3',
    title: 'Street Portrait',
    description: 'A candid portrait from the streets of New York',
    imageUrl: 'https://images.pexels.com/photos/2531355/pexels-photo-2531355.jpeg',
    category: 'portrait',
    date: '2023-04-10', 
  },
  {
    id: '4',
    title: 'Ocean Waves',
    description: 'Powerful waves crashing against the shore',
    imageUrl: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg',
    category: 'landscape',
    date: '2023-07-05',
  },
  {
    id: '5',
    title: 'City Lights',
    description: 'Night skyline of a bustling metropolis',
    imageUrl: 'https://images.pexels.com/photos/316093/pexels-photo-316093.jpeg',
    category: 'street',
    date: '2023-08-12',
  },
  {
    id: '6',
    title: 'Forest Path',
    description: 'Sunlight filtering through dense forest',
    imageUrl: 'https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg',
    category: 'landscape',
    date: '2023-09-03',
  },
  {
    id: '7',
    title: 'Abstract Patterns',
    description: 'Natural patterns creating abstract visuals',
    imageUrl: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg',
    category: 'abstract',
    date: '2023-03-29',
  },
  {
    id: '8',
    title: 'Street Cafe',
    description: 'Charming cafe on a cobblestone street',
    imageUrl: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg',
    category: 'street',
    date: '2023-10-17',
  },
  {
    id: '9',
    title: 'Wildlife Close-up',
    description: 'Detailed close-up of a wild animal',
    imageUrl: 'https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg',
    category: 'wildlife',
    date: '2023-11-05',
  },
  {
    id: '10',
    title: 'Minimalist Architecture',
    description: 'Clean lines of modern minimalist building',
    imageUrl: 'https://images.pexels.com/photos/2093252/pexels-photo-2093252.jpeg',
    category: 'architecture',
    date: '2023-12-12',
  },
  {
    id: '11',
    title: 'Golden Hour Landscape',
    description: 'Warm golden light illuminating rolling hills',
    imageUrl: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
    category: 'landscape',
    date: '2022-08-20',
  },
  {
    id: '12',
    title: 'Vintage Street Scene',
    description: 'Classic cars and vintage architecture',
    imageUrl: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg',
    category: 'street',
    date: '2022-05-14',
  },
  {
    id: '13',
    title: 'Desert Sunset',
    description: 'Dramatic sunset over sand dunes',
    imageUrl: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg',
    category: 'landscape',
    date: '2024-02-28',
  },
  {
    id: '14',
    title: 'Modern Portrait',
    description: 'Contemporary portrait with dramatic lighting',
    imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    category: 'portrait',
    date: '2024-01-15',
  },
  {
    id: '15',
    title: 'Industrial Abstract',
    description: 'Abstract patterns in industrial architecture',
    imageUrl: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
    category: 'abstract',
    date: '2022-11-30',
  },
];

export const photoCategories = [
  { id: 'all', name: 'All' },
  { id: 'landscape', name: 'Landscape' },
  { id: 'architecture', name: 'Architecture' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'street', name: 'Street' },
  { id: 'abstract', name: 'Abstract' },
  { id: 'wildlife', name: 'Wildlife' },
];

// Extract unique years from photos and create year filter options
export const getUniqueYears = (): { id: string; name: string }[] => {
  const years = [...new Set(photos.map(photo => new Date(photo.date).getFullYear()))]
    .sort((a, b) => b - a); // Sort in descending order (newest first)
  
  return [
    { id: 'all', name: 'All Years' },
    ...years.map(year => ({ id: year.toString(), name: year.toString() }))
  ];
};

export const photoYears = getUniqueYears();