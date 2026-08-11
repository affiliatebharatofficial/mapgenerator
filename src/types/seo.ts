export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  robots?: string;
  ogType?: 'website' | 'article' | 'profile';
  jsonLd?: Record<string, any>[];
}

export interface SeoPageConfig {
  slug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  category: 'generator' | 'style' | 'usecase' | 'tool';
  style?: string;
  useCase?: string;
  features: string[];
  faq: { question: string; answer: string }[];
  relatedTools: string[];
  relatedPages: string[];
}

export interface FreeToolConfig {
  id: string;
  name: string;
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  inputs: {
    id: string;
    label: string;
    type: 'select' | 'text' | 'number';
    options?: string[];
    defaultVal?: string | number;
  }[];
  ctaText: string;
  ctaTarget: string;
}

export interface AdminSeoSettings {
  siteTitle: string;
  siteDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  organizationName: string;
  canonicalDomain: string;
  sitemapEnabled: boolean;
  robotsEnabled: boolean;
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'map' | 'world' | 'creator' | 'tool';
  image?: string;
  authorName?: string;
}
