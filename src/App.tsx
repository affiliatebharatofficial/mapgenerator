import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/supabase/authStore';
import { SubscriptionProvider } from './lib/supabase/subscriptionStore';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { GalleryPage } from './pages/GalleryPage';
import { PublicMapPage } from './pages/PublicMapPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SettingsBillingPage } from './pages/SettingsBillingPage';
import { PricingPage } from './pages/PricingPage';
import { WorldsDashboardPage } from './pages/world/WorldsDashboardPage';
import { WorldExplorerPage } from './pages/world/WorldExplorerPage';
import { ExplorePage } from './pages/ExplorePage';
import { FeedPage } from './pages/FeedPage';
import { PublicCollectionPage } from './pages/PublicCollectionPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CommunityGuidelinesPage } from './pages/CommunityGuidelinesPage';
import { SeoLandingPage } from './pages/seo/SeoLandingPage';
import { StyleLandingPage } from './pages/seo/StyleLandingPage';
import { UseCaseLandingPage } from './pages/seo/UseCaseLandingPage';
import { ToolPage } from './pages/seo/ToolPage';
import { SearchPage } from './pages/seo/SearchPage';
import { NotFoundPage } from './pages/seo/NotFoundPage';
import { SeoAdminPage } from './pages/admin/SeoAdminPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ExportStudioPage } from './pages/export/ExportStudioPage';
import { ExportHistoryPage } from './pages/export/ExportHistoryPage';
import { WorldBiblePage } from './pages/world/WorldBiblePage';
import { ImageStudioPage } from './pages/image-studio/ImageStudioPage';
import { SeoService } from './lib/seo/seoService';
import type { MapStyle, MapType } from './types/map';

function AppRouter() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const [path, setPath] = useState<string>(() => window.location.pathname);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [presetConfig, setPresetConfig] = useState<{ seed: number; type: MapType; style: MapStyle } | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
    window.scrollTo(0, 0);
  };

  const handleSelectMapPreset = (seed: number, type: MapType, style: MapStyle) => {
    setPresetConfig({ seed, type, style });
    setEditingMapId(null);
    navigate('/create');
  };

  const handleEditMap = (mapId: string) => {
    setEditingMapId(mapId);
    setPresetConfig(null);
    navigate('/create');
  };

  const handleViewPublicMap = (slug: string) => {
    navigate(`/map/${slug}`);
  };

  const handleNavigateProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  // Phase 21 AI Image Studio Routes
  if (path.startsWith('/image-studio')) {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onNavigateHome={() => navigate('/')}
          onNavigateSignup={() => navigate('/signup')}
          onNavigateForgotPassword={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate('/image-studio')}
        />
      );
    }

    let tab: 'generate' | 'library' | 'favorites' | 'styles' | 'recent' = 'generate';
    if (path === '/image-studio/library') tab = 'library';
    else if (path === '/image-studio/favorites') tab = 'favorites';
    else if (path === '/image-studio/styles') tab = 'styles';
    else if (path === '/image-studio/recent') tab = 'recent';

    return (
      <ImageStudioPage
        initialTab={tab}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  // Phase 8 Community & Discovery Routes
  if (path === '/explore') {
    return (
      <ExplorePage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onViewPublicMap={handleViewPublicMap}
        onNavigateProfile={handleNavigateProfile}
      />
    );
  }

  if (path === '/feed') {
    return (
      <FeedPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onViewPublicMap={handleViewPublicMap}
        onNavigateProfile={handleNavigateProfile}
      />
    );
  }

  if (path.startsWith('/collection/')) {
    const slug = path.replace('/collection/', '');
    return (
      <PublicCollectionPage
        slug={slug}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onViewPublicMap={handleViewPublicMap}
      />
    );
  }

  if (path === '/notifications') {
    return (
      <NotificationsPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onNavigateProfile={handleNavigateProfile}
      />
    );
  }

  if (path === '/community-guidelines') {
    return (
      <CommunityGuidelinesPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }


  // Phase 12 Export Studio Routes
  if (path === '/export' || (path.startsWith('/world/') && path.endsWith('/export'))) {
    return (
      <ExportStudioPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  if (path === '/exports') {
    return (
      <ExportHistoryPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  // Phase 11 SEO & Programmatic Pages
  if (
    path === '/fantasy-map-generator' ||
    path === '/ai-fantasy-map-generator' ||
    path === '/dnd-map-generator' ||
    path === '/rpg-map-generator' ||
    path === '/world-map-generator' ||
    path === '/kingdom-map-generator' ||
    path === '/island-map-generator' ||
    path === '/continent-map-generator' ||
    path === '/city-map-generator' ||
    path === '/dungeon-map-generator' ||
    path === '/worldbook-generator' ||
    path === '/fantasy-map-print'
  ) {
    return (
      <SeoLandingPage
        slug={path}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  if (path.startsWith('/styles/')) {
    const styleName = path.replace('/styles/', '');
    return (
      <StyleLandingPage
        styleName={styleName}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  if (path.startsWith('/for/')) {
    const useCase = path.replace('/for/', '');
    return (
      <UseCaseLandingPage
        useCase={useCase}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  if (path.startsWith('/tools/')) {
    const toolSlug = path.replace('/tools/', '');
    return (
      <ToolPage
        toolSlug={toolSlug}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  if (path.startsWith('/search')) {
    return (
      <SearchPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onViewPublicMap={handleViewPublicMap}
      />
    );
  }

  if (path === '/admin/login') {
    return (
      <AdminLoginPage
        onLoginSuccess={() => navigate('/admin/dashboard')}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  if (path.startsWith('/admin')) {
    if (!isAdmin) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => navigate('/admin/dashboard')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    if (path === '/admin/seo') {
      return (
        <SeoAdminPage
          onNavigateCreate={() => {
            setEditingMapId(null);
            setPresetConfig(null);
            navigate('/create');
          }}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    return (
      <AdminDashboardPage
        onNavigateHome={() => navigate('/')}
        onLogout={() => {
          logout();
          navigate('/admin/login');
        }}
      />
    );
  }


  // Phase 5 Worldbuilding Routes
  if (path === '/worlds') {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onNavigateHome={() => navigate('/')}
          onNavigateSignup={() => navigate('/signup')}
          onNavigateForgotPassword={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate('/worlds')}
        />
      );
    }

    return (
      <WorldsDashboardPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onOpenWorld={(worldId) => navigate(`/world/${worldId}`)}
      />
    );
  }

  if (path.startsWith('/world/') && path.endsWith('/bible')) {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onNavigateHome={() => navigate('/')}
          onNavigateSignup={() => navigate('/signup')}
          onNavigateForgotPassword={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate(path)}
        />
      );
    }

    const worldId = path.replace('/world/', '').replace('/bible', '');
    return (
      <WorldBiblePage
        worldId={worldId}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  if (path.startsWith('/world/')) {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onNavigateHome={() => navigate('/')}
          onNavigateSignup={() => navigate('/signup')}
          onNavigateForgotPassword={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate(path)}
        />
      );
    }

    const worldId = path.replace('/world/', '');
    return (
      <WorldExplorerPage
        worldId={worldId}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onNavigateMapEditor={handleEditMap}
      />
    );
  }

  // Phase 4 Monetization & Billing Routes
  if (path === '/pricing') {
    return (
      <PricingPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onNavigateLogin={() => navigate('/login')}
      />
    );
  }

  if (path === '/settings/billing') {
    return (
      <SettingsBillingPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onNavigatePricing={() => navigate('/pricing')}
      />
    );
  }

  if (path === '/login') {
    return (
      <LoginPage
        onNavigateHome={() => navigate('/')}
        onNavigateSignup={() => navigate('/signup')}
        onNavigateForgotPassword={() => navigate('/forgot-password')}
        onLoginSuccess={() => navigate('/worlds')}
      />
    );
  }

  if (path === '/signup') {
    return (
      <SignupPage
        onNavigateHome={() => navigate('/')}
        onNavigateLogin={() => navigate('/login')}
        onSignupSuccess={() => navigate('/worlds')}
      />
    );
  }

  if (path === '/forgot-password') {
    return (
      <ForgotPasswordPage onNavigateLogin={() => navigate('/login')} />
    );
  }

  if (path === '/dashboard') {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onNavigateHome={() => navigate('/')}
          onNavigateSignup={() => navigate('/signup')}
          onNavigateForgotPassword={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate('/dashboard')}
        />
      );
    }
    return (
      <DashboardPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onEditMap={handleEditMap}
        onViewPublicMap={handleViewPublicMap}
      />
    );
  }

  if (path === '/gallery') {
    return (
      <GalleryPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onViewPublicMap={handleViewPublicMap}
        onNavigateProfile={handleNavigateProfile}
      />
    );
  }

  if (path.startsWith('/map/')) {
    const slug = path.replace('/map/', '');
    return (
      <PublicMapPage
        slug={slug}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onNavigateLogin={() => navigate('/login')}
        onNavigateProfile={handleNavigateProfile}
        onRemixComplete={(newMapId) => {
          setEditingMapId(newMapId);
          navigate('/create');
        }}
      />
    );
  }

  if (path.startsWith('/profile/')) {
    const username = path.replace('/profile/', '');
    return (
      <ProfilePage
        username={username}
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
        onViewPublicMap={handleViewPublicMap}
      />
    );
  }

  if (path === '/settings') {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onNavigateHome={() => navigate('/')}
          onNavigateSignup={() => navigate('/signup')}
          onNavigateForgotPassword={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate('/settings')}
        />
      );
    }
    return (
      <SettingsPage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  // Super Admin Control Center Routes (/admin, /admin/dashboard, /admin/login, /admin/seo)
  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      return (
        <AdminLoginPage
          onNavigateHome={() => navigate('/')}
          onLoginSuccess={() => navigate('/admin')}
        />
      );
    }

    if (path === '/admin/seo') {
      if (!isAdmin) {
        return (
          <AdminLoginPage
            onNavigateHome={() => navigate('/')}
            onLoginSuccess={() => navigate('/admin/seo')}
          />
        );
      }
      return (
        <SeoAdminPage
          onNavigateCreate={() => {
            setEditingMapId(null);
            setPresetConfig(null);
            navigate('/create');
          }}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    if (!isAdmin) {
      return (
        <AdminLoginPage
          onNavigateHome={() => navigate('/')}
          onLoginSuccess={() => navigate('/admin')}
        />
      );
    }

    return (
      <AdminDashboardPage
        onNavigateHome={() => navigate('/')}
        onLogout={() => {
          logout();
          navigate('/admin/login');
        }}
      />
    );
  }

  if (path === '/create') {
    if (!isAuthenticated) {
      return (
        <LoginPage
          onNavigateHome={() => navigate('/')}
          onNavigateSignup={() => navigate('/signup')}
          onNavigateForgotPassword={() => navigate('/forgot-password')}
          onLoginSuccess={() => navigate('/create')}
        />
      );
    }

    return (
      <CreatePage
        onBackToHome={() => navigate('/')}
        onNavigateLogin={() => navigate('/login')}
        onNavigateSignup={() => navigate('/signup')}
        onNavigatePricing={() => navigate('/pricing')}
        onNavigateDashboard={() => navigate('/dashboard')}
        editingMapId={editingMapId}
        presetConfig={presetConfig}
      />
    );
  }

  if (path === '/') {
    return (
      <HomePage
        onNavigateCreate={() => {
          setEditingMapId(null);
          setPresetConfig(null);
          navigate('/create');
        }}
        onSelectMapPreset={handleSelectMapPreset}
      />
    );
  }

  // 404 Fallback for unknown routes
  return (
    <NotFoundPage
      onNavigateCreate={() => {
        setEditingMapId(null);
        setPresetConfig(null);
        navigate('/create');
      }}
      onNavigateHome={() => navigate('/')}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppRouter />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
