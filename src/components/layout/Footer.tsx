import React from 'react';
import { SeoFooter } from '../seo/SeoFooter';

interface FooterProps {
  onNavigateCreate: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return <SeoFooter />;
};
