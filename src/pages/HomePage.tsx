import React from 'react';
import Hero from '../components/home/Hero';
import Bio from '../components/home/Bio';
import FeaturedPhotos from '../components/home/FeaturedPhotos';
import FeaturedPosts from '../components/home/FeaturedPosts';

const HomePage: React.FC = () => {
  return (
    <main>
      <Hero />
      <Bio />
      <FeaturedPosts />
      <FeaturedPhotos />
    </main>
  );
};

export default HomePage;