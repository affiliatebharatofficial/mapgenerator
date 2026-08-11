import type { SeoMetadata, AdminSeoSettings } from '../../types/seo';

const DEFAULT_DOMAIN = 'https://createfantasymap.com';
const ADMIN_SEO_SETTINGS_KEY = 'createfantasymap_admin_seo_settings';

export const SeoService = {
  // ----------------------------------------------------
  // 1. DEFAULT ADMIN SEO SETTINGS
  // ----------------------------------------------------
  getAdminSettings(): AdminSeoSettings {
    const data = localStorage.getItem(ADMIN_SEO_SETTINGS_KEY);
    if (data) return JSON.parse(data);
    return {
      siteTitle: 'Fantasy Map Generator — Create AI Fantasy Worlds',
      siteDescription: 'Create detailed fantasy maps for worlds, kingdoms, RPG campaigns, novels and games. AI & procedural cartography tools.',
      defaultOgImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=630&fit=crop',
      twitterHandle: '@CreateFantasyMap',
      organizationName: 'CreateFantasyMap.com',
      canonicalDomain: DEFAULT_DOMAIN,
      sitemapEnabled: true,
      robotsEnabled: true
    };
  },

  saveAdminSettings(settings: AdminSeoSettings) {
    localStorage.setItem(ADMIN_SEO_SETTINGS_KEY, JSON.stringify(settings));
  },

  // ----------------------------------------------------
  // 2. METADATA & JSON-LD SCHEMA BUILDER
  // ----------------------------------------------------
  generateMetadata(
    path: string,
    overrides?: Partial<SeoMetadata>,
    faqList?: { question: string; answer: string }[]
  ): SeoMetadata {
    const admin = this.getAdminSettings();
    const canonical = `${admin.canonicalDomain}${path}`;
    const title = overrides?.title ? `${overrides.title} | ${admin.organizationName}` : admin.siteTitle;
    const description = overrides?.description || admin.siteDescription;
    const image = overrides?.image || admin.defaultOgImage;
    const robots = overrides?.robots || (path.startsWith('/dashboard') || path.startsWith('/create') || path.startsWith('/settings') ? 'noindex, nofollow' : 'index, follow');

    const jsonLd: Record<string, any>[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: admin.organizationName,
        url: canonical,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires HTML5 canvas support',
        description
      }
    ];

    if (faqList && faqList.length > 0) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqList.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      });
    }

    return {
      title,
      description,
      canonical,
      image,
      robots,
      ogType: overrides?.ogType || 'website',
      jsonLd
    };
  },

  // ----------------------------------------------------
  // 3. DYNAMIC SITEMAP GENERATOR
  // ----------------------------------------------------
  generateSitemapXml(): string {
    const admin = this.getAdminSettings();
    const publicRoutes = [
      '/',
      '/fantasy-map-generator',
      '/ai-fantasy-map-generator',
      '/dnd-map-generator',
      '/rpg-map-generator',
      '/world-map-generator',
      '/kingdom-map-generator',
      '/island-map-generator',
      '/continent-map-generator',
      '/city-map-generator',
      '/dungeon-map-generator',
      '/styles/dark-fantasy',
      '/styles/high-fantasy',
      '/styles/medieval',
      '/styles/parchment',
      '/styles/hand-drawn',
      '/styles/rpg',
      '/for/dnd',
      '/for/worldbuilders',
      '/for/writers',
      '/for/novelists',
      '/for/game-masters',
      '/for/rpg',
      '/tools/fantasy-name-generator',
      '/tools/kingdom-name-generator',
      '/tools/city-name-generator',
      '/tools/village-name-generator',
      '/tools/character-name-generator',
      '/tools/faction-name-generator',
      '/tools/location-generator',
      '/tools/river-name-generator',
      '/tools/mountain-name-generator',
      '/tools/quest-generator',
      '/explore',
      '/feed',
      '/pricing',
      '/community-guidelines'
    ];

    const today = new Date().toISOString().split('T')[0];

    const urls = publicRoutes
      .map(
        (r) => `  <url>
    <loc>${admin.canonicalDomain}${r}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${r === '/' ? '1.0' : r.includes('generator') ? '0.9' : '0.8'}</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  },

  // ----------------------------------------------------
  // 4. ROBOTS.TXT GENERATOR
  // ----------------------------------------------------
  generateRobotsTxt(): string {
    const admin = this.getAdminSettings();
    return `User-agent: *
Disallow: /dashboard
Disallow: /create
Disallow: /settings
Disallow: /notifications
Disallow: /private/

Allow: /
Allow: /fantasy-map-generator
Allow: /ai-fantasy-map-generator
Allow: /tools/
Allow: /styles/
Allow: /for/

Sitemap: ${admin.canonicalDomain}/sitemap.xml`;
  }
};
