import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Globe, Settings, Eye, FileText, Check, Save } from 'lucide-react';
import { SeoService } from '../../lib/seo/seoService';
import type { AdminSeoSettings } from '../../types/seo';

interface SeoAdminPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const SeoAdminPage: React.FC<SeoAdminPageProps> = ({
  onNavigateCreate,
  onNavigateHome
}) => {
  const [settings, setSettings] = useState<AdminSeoSettings>(() => SeoService.getAdminSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    SeoService.saveAdminSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-400" />
              <h1 className="font-cinzel font-bold text-2xl text-slate-100">SEO & Search Controls Admin</h1>
            </div>
            <p className="text-xs text-slate-400">Configure global metadata, search console canonicals, social sharing cards, and XML sitemaps.</p>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved Settings!' : 'Save SEO Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Settings */}
          <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <h3 className="font-cinzel font-bold text-base text-amber-300">Global Meta Configuration</h3>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Site Meta Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Canonical Domain</label>
              <input
                type="text"
                value={settings.canonicalDomain}
                onChange={(e) => setSettings({ ...settings, canonicalDomain: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Default Social OpenGraph Image URL</label>
              <input
                type="text"
                value={settings.defaultOgImage}
                onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </form>

          {/* Live Preview Cards */}
          <div className="space-y-6">
            {/* Google Search Result Preview */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-cinzel font-bold text-sm text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" /> Google Search Result Live Preview
              </h3>
              <div className="bg-[#121620] p-4 rounded-xl border border-slate-800 space-y-1 font-sans">
                <span className="text-[11px] text-slate-400 font-mono block">{settings.canonicalDomain}</span>
                <h4 className="text-sky-400 font-semibold text-base hover:underline cursor-pointer">{settings.siteTitle}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{settings.siteDescription}</p>
              </div>
            </div>

            {/* Social Share Card Preview */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-cinzel font-bold text-sm text-slate-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" /> OpenGraph Social Card Preview
              </h3>
              <div className="bg-[#121620] rounded-xl border border-slate-800 overflow-hidden">
                <img src={settings.defaultOgImage} alt="Social Card" className="w-full h-40 object-cover" />
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{settings.canonicalDomain.replace('https://', '')}</span>
                  <h4 className="font-cinzel font-bold text-sm text-slate-100">{settings.siteTitle}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{settings.siteDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
