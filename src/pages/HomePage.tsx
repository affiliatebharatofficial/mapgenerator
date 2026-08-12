import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/landing/Hero';
import { ProductIntroSection } from '../components/landing/ProductIntroSection';
import { WhatCanYouCreateSection } from '../components/landing/WhatCanYouCreateSection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { AIWorldbuildingSection } from '../components/landing/AIWorldbuildingSection';
import { UseCasesSection } from '../components/landing/UseCasesSection';
import { EducationalSection } from '../components/landing/EducationalSection';
import { FantasyMapIdeasSection } from '../components/landing/FantasyMapIdeasSection';
import { FreeLaunchSection } from '../components/landing/FreeLaunchSection';
import { MapStylesShowcase } from '../components/landing/MapStylesShowcase';
import { GallerySection } from '../components/landing/GallerySection';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
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
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      <Header
        onNavigateCreate={onNavigateCreate}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateLogin={() => (window.location.pathname = '/login')}
        onNavigateSignup={() => (window.location.pathname = '/signup')}
      />

      <main className="flex-1">
        {/* H1: Fantasy Map Generator */}
        <Hero
          onNavigateCreate={onNavigateCreate}
          onSelectMapPreset={onSelectMapPreset}
          onExploreGallery={handleExploreGallery}
        />

        {/* H2: Create Your Own Fantasy World */}
        <ProductIntroSection />

        {/* H2: What Can You Create? */}
        <WhatCanYouCreateSection />

        {/* H2: How to Create a Fantasy Map */}
        <HowItWorks />

        {/* H2: Build Detailed Fantasy Maps */}
        <FeaturesSection />

        {/* H2: Bring Your Fantasy World to Life */}
        <AIWorldbuildingSection />

        {/* H2: Who Is CreateFantasyMap For? */}
        <UseCasesSection />

        {/* Educational sections: What Is a Fantasy Map Generator?, How to Make a Fantasy Map, What Should a Fantasy Map Include?, Create Maps for D&D and RPG Campaigns */}
        <EducationalSection />

        {/* H2: Fantasy Map Ideas */}
        <FantasyMapIdeasSection />

        {/* H2: Free Fantasy Map Generator */}
        <FreeLaunchSection onNavigateCreate={onNavigateCreate} />

        {/* Visual Map Styles Showcase */}
        <MapStylesShowcase />

        {/* Public Gallery Section */}
        <GallerySection onSelectMapPreset={onSelectMapPreset} />

        {/* H2: Frequently Asked Questions */}
        <FAQSection />

        {/* H2: Start Building Your Fantasy World */}
        <FinalCTASection onNavigateCreate={onNavigateCreate} />
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
