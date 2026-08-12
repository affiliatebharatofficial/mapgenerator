import React, { useState } from 'react';
import { Compass, Sparkles, Menu, X, User, Settings, LogOut, LayoutDashboard, CreditCard, Globe, Shield, BookOpen, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../lib/supabase/authStore';
import { useSubscription } from '../../lib/supabase/subscriptionStore';

interface HeaderProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onNavigateLogin?: () => void;
  onNavigateSignup?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateWorlds?: () => void;
  onNavigateGallery?: () => void;
  onNavigatePricing?: () => void;
  onNavigateBilling?: () => void;
  onNavigateProfile?: (username: string) => void;
  onNavigateSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onNavigateLogin,
  onNavigateSignup,
  onNavigateDashboard,
  onNavigateWorlds,
  onNavigateGallery,
  onNavigatePricing,
  onNavigateBilling,
  onNavigateProfile,
  onNavigateSettings
}) => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { currentPlan } = useSubscription();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateGallery && id === 'gallery') {
      onNavigateGallery();
    } else {
      onNavigateHome();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0d11]/90 backdrop-blur-md border-b border-amber-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 group focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b0d11] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-cinzel font-bold text-base sm:text-lg tracking-wider text-slate-100 group-hover:text-amber-300 transition-colors whitespace-nowrap">
              CreateFantasyMap
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-400/80 font-mono tracking-widest uppercase whitespace-nowrap">
              Cartography AI
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-4 text-xs font-semibold text-slate-300">
          <button
            onClick={onNavigateCreate}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Map</span>
          </button>

          <button
            onClick={() => (window.location.pathname = '/explore')}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Explore</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => (window.location.pathname = '/feed')}
              className="hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              Feed
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => (onNavigateWorlds ? onNavigateWorlds() : (window.location.pathname = '/worlds'))}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-300 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Worlds</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => (window.location.pathname = '/campaigns')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-400 whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Campaigns</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => (window.location.pathname = '/image-studio')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-300 whitespace-nowrap"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Image Studio</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => (window.location.pathname = '/export')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-300 whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Studio</span>
            </button>
          )}

          <button
            onClick={() => (onNavigateGallery ? onNavigateGallery() : scrollToSection('gallery'))}
            className="hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Gallery
          </button>

          <button
            onClick={() => (onNavigatePricing ? onNavigatePricing() : (window.location.pathname = '/pricing'))}
            className="hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Pricing
          </button>

          {isAuthenticated && (
            <button
              onClick={onNavigateDashboard}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-300 whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>My Maps</span>
            </button>
          )}
        </nav>

        {/* Desktop Right Action CTAs */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-amber-500/30 hover:border-amber-400 bg-slate-900/80 transition-all max-w-[180px]"
              >
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`}
                  alt={profile?.display_name}
                  className="w-7 h-7 rounded-lg border border-amber-500/40 bg-slate-950 shrink-0"
                />
                <div className="text-left pr-1 min-w-0 flex-1">
                  <span className="text-xs font-bold text-amber-200 block truncate max-w-[90px]" title={profile?.display_name || user?.email || ''}>
                    {profile?.display_name || user?.email}
                  </span>
                  <span className="text-[8px] font-bold font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase inline-block leading-tight">
                    {currentPlan}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#121620] border border-amber-500/30 rounded-xl p-2 shadow-2xl space-y-1 animate-in fade-in duration-150 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-100 truncate">{profile?.display_name || user?.email}</p>
                      <p className="text-[10px] font-mono text-amber-400 truncate">@{profile?.username || 'user'}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase shrink-0">
                      {currentPlan}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onNavigateWorlds) onNavigateWorlds();
                      else window.location.pathname = '/worlds';
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4 text-amber-400" /> My Worlds
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      window.location.pathname = '/image-studio';
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" /> Image Studio
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onNavigateDashboard) onNavigateDashboard();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> My Maps
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onNavigateBilling) onNavigateBilling();
                      else window.location.pathname = '/settings/billing';
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Billing & Plan
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onNavigateProfile && profile) onNavigateProfile(profile.username);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onNavigateSettings) onNavigateSettings();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        onNavigateHome();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  if (onNavigateLogin) onNavigateLogin();
                  else window.location.pathname = '/login';
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  if (onNavigateSignup) onNavigateSignup();
                  else window.location.pathname = '/signup';
                }}
                className="px-3.5 py-2 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition-colors whitespace-nowrap"
              >
                Sign Up
              </button>
              <button
                onClick={onNavigateCreate}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create a Map</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-300 hover:text-amber-400 rounded-lg"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e1118] border-b border-amber-500/20 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-200">
            <button
              onClick={onNavigateCreate}
              className="text-left py-2.5 px-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Map Workspace</span>
            </button>

            {isAuthenticated ? (
              <>
                <button onClick={() => { setMobileMenuOpen(false); if (onNavigateWorlds) onNavigateWorlds(); else window.location.pathname = '/worlds'; }} className="text-left py-2 px-3 text-amber-300 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> My Worlds
                </button>
                <button onClick={() => { setMobileMenuOpen(false); if (onNavigateDashboard) onNavigateDashboard(); }} className="text-left py-2 px-3 hover:text-amber-400 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> My Maps
                </button>
                <button onClick={() => { setMobileMenuOpen(false); if (onNavigateBilling) onNavigateBilling(); else window.location.pathname = '/settings/billing'; }} className="text-left py-2 px-3 hover:text-amber-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Billing & Plan
                </button>
                <button onClick={() => { setMobileMenuOpen(false); if (onNavigateProfile && profile) onNavigateProfile(profile.username); }} className="text-left py-2 px-3 hover:text-amber-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button onClick={() => { setMobileMenuOpen(false); if (onNavigateSettings) onNavigateSettings(); }} className="text-left py-2 px-3 hover:text-amber-400 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button onClick={async () => { setMobileMenuOpen(false); await logout(); onNavigateHome(); }} className="text-left py-2 px-3 text-rose-400 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => (onNavigateGallery ? onNavigateGallery() : scrollToSection('gallery'))} className="text-left py-2 px-3 hover:text-amber-400">
                  Gallery
                </button>
                <button onClick={() => (onNavigatePricing ? onNavigatePricing() : (window.location.pathname = '/pricing'))} className="text-left py-2 px-3 hover:text-amber-400">
                  Pricing
                </button>
                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onNavigateLogin) onNavigateLogin();
                      else window.location.pathname = '/login';
                    }}
                    className="flex-1 py-2.5 text-center text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onNavigateSignup) onNavigateSignup();
                      else window.location.pathname = '/signup';
                    }}
                    className="flex-1 py-2.5 text-center text-xs font-bold text-slate-950 bg-amber-500 rounded-xl"
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
