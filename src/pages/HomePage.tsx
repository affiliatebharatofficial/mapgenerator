import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { MapStylesShowcase } from '../components/landing/MapStylesShowcase';
import { GallerySection } from '../components/landing/GallerySection';
import { FAQSection } from '../components/landing/FAQSection';
import type { MapStyle, MapType } from '../types/map';

interface HomePageProps {
  onNavigateCreate: () => void;
  onSelectMapPreset: (seed: number, type: MapType, style: MapStyle) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateCreate, onSelectMapPreset }) => {
  const handleExploreGallery = () => {
    const el = document.getElementById('gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
      <Header
        onNavigateCreate={onNavigateCreate}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateLogin={() => (window.location.pathname = '/login')}
        onNavigateSignup={() => (window.location.pathname = '/signup')}
      />

      <main className="flex-1">
        <Hero
          onNavigateCreate={onNavigateCreate}
          onSelectMapPreset={onSelectMapPreset}
          onExploreGallery={handleExploreGallery}
        />
        <HowItWorks />
        <FeaturesSection />
        <MapStylesShowcase />
        <GallerySection onSelectMapPreset={onSelectMapPreset} />
        <FAQSection />
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
