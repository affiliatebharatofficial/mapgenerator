import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MapCanvas } from '../components/map/MapCanvas';
import {
  Heart,
  Share2,
  Sparkles,
  UserPlus,
  UserCheck,
  Bookmark,
  ArrowLeft,
  GitFork,
  Flag
} from 'lucide-react';
import { MapService, type CloudMapRecord } from '../lib/supabase/mapService';
import { CommunityService } from '../lib/supabase/communityService';
import { useAuth } from '../lib/supabase/authStore';
import { useMapTransform } from '../hooks/useMapTransform';
import { ShareModal } from '../components/social/ShareModal';
import { SaveToCollectionModal } from '../components/community/SaveToCollectionModal';
import { CommentsSection } from '../components/community/CommentsSection';
import { ReportModal } from '../components/community/ReportModal';
import type { MapLayers } from '../types/map';

interface PublicMapPageProps {
  slug: string;
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onNavigateProfile: (username: string) => void;
  onRemixComplete: (newMapId: string) => void;
}

export const PublicMapPage: React.FC<PublicMapPageProps> = ({
  slug,
  onNavigateCreate,
  onNavigateHome,
  onNavigateLogin,
  onNavigateProfile,
  onRemixComplete
}) => {
  const { user, isAuthenticated, profile: authProfile } = useAuth();
  const [mapRecord, setMapRecord] = useState<CloudMapRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(14);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveColModal, setShowSaveColModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);

  const [layers] = useState<MapLayers>({
    terrain: true,
    mountains: true,
    forests: true,
    rivers: true,
    roads: true,
    cities: true,
    kingdoms: true,
    labels: true,
    grid: false,
    compass: true,
    legend: true
  });

  const transformHook = useMapTransform(1200, 800);

  useEffect(() => {
    async function loadMap() {
      setLoading(true);
      const record = await MapService.getMapBySlug(slug, user?.id);
      if (record) {
        setMapRecord(record);
        if (user && record.author_username) {
          setIsFollowing(CommunityService.isFollowing(user.id, record.author_username));
        }
      }
      setLoading(false);
    }
    loadMap();
  }, [slug, user?.id]);

  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      onNavigateLogin();
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      onNavigateLogin();
      return;
    }
    if (!mapRecord || !mapRecord.author_username) return;

    if (isFollowing) {
      CommunityService.unfollowUser(user!.id, mapRecord.author_username);
      setIsFollowing(false);
    } else {
      CommunityService.followUser(user!.id, mapRecord.author_username, {
        name: authProfile?.display_name || 'Explorer',
        username: authProfile?.username || 'explorer',
        avatar: authProfile?.avatar_url
      });
      setIsFollowing(true);
    }
  };

  const handleRemix = async () => {
    if (!isAuthenticated) {
      onNavigateLogin();
      return;
    }
    if (!mapRecord) return;

    setIsRemixing(true);
    const remixedMap = await MapService.saveMap(user!.id, mapRecord.map_data, {
      title: `${mapRecord.title} Remix`,
      is_public: false
    });
    setIsRemixing(false);

    if (remixedMap) {
      onRemixComplete(remixedMap.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
        <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-cinzel text-amber-300">Loading Map Archive...</p>
        </div>
        <Footer onNavigateCreate={onNavigateCreate} />
      </div>
    );
  }

  if (!mapRecord) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans">
        <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h2 className="font-cinzel font-bold text-2xl text-rose-400">Map Not Found</h2>
          <p className="text-xs text-slate-400">This map may be private or has been removed by its author.</p>
          <button onClick={onNavigateHome} className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
            Return to Home
          </button>
        </div>
        <Footer onNavigateCreate={onNavigateCreate} />
      </div>
    );
  }

  const authorUsername = mapRecord.author_username || 'master_cartographer';
  const authorName = mapRecord.author_name || 'Master Cartographer';

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={onNavigateHome}
              className="text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Gallery
            </button>
            <h1 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100">{mapRecord.title}</h1>

            {/* Author Info & Follow CTA */}
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <button
                onClick={() => onNavigateProfile(authorUsername)}
                className="flex items-center gap-1.5 hover:text-amber-300 font-bold"
              >
                <span>By {authorName}</span>
              </button>

              <button
                onClick={handleToggleFollow}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isFollowing
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950'
                }`}
              >
                {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>

              <span>•</span>
              <span className="font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {mapRecord.map_style}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleLikeToggle}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLiked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={() => setShowSaveColModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Bookmark className="w-4 h-4 text-amber-400" /> Save
            </button>

            <button
              onClick={handleRemix}
              disabled={isRemixing}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRemixing ? 'Remixing...' : 'Remix Map'}</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl"
              title="Report Content"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Remix Attribution Banner */}
        <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl flex items-center justify-between text-xs text-purple-200 font-mono">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-purple-400" />
            <span>Remixed from <strong>{mapRecord.title}</strong> by <strong className="text-amber-300">@{authorUsername}</strong></span>
          </div>
          <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded text-purple-300">Original Attribution Preserved</span>
        </div>

        {/* Center Interactive Map Viewer */}
        <div className="h-[600px] w-full rounded-3xl border border-amber-500/20 overflow-hidden relative bg-[#090b0e]">
          <MapCanvas
            map={mapRecord.map_data}
            layers={layers}
            selectedObject={null}
            onSelectObject={() => {}}
            onUpdateObjectPosition={() => {}}
            transform={{ x: transformHook.transform.x, y: transformHook.transform.y, k: transformHook.transform.k }}
            onZoomIn={transformHook.zoomIn}
            onZoomOut={transformHook.zoomOut}
            onReset={transformHook.resetView}
            onFit={transformHook.fitToScreen}
            onWheel={transformHook.handleWheel}
            onMouseDown={transformHook.handleMouseDown}
            onMouseMove={transformHook.handleMouseMove}
            onMouseUp={transformHook.handleMouseUp}
            svgRef={React.createRef()}
          />
        </div>

        {/* Community Discussion & Comments Section */}
        <CommentsSection
          targetId={mapRecord.id}
          targetType="map"
          onReportContent={(cmtId) => {
            setReportCommentId(cmtId);
            setShowReportModal(true);
          }}
        />
      </main>

      {/* Save To Collection Modal */}
      {showSaveColModal && (
        <SaveToCollectionModal
          mapId={mapRecord.id}
          onClose={() => setShowSaveColModal(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          mapTitle={mapRecord.title}
          shareUrl={window.location.href}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetId={reportCommentId || mapRecord.id}
          targetType={reportCommentId ? 'comment' : 'map'}
          onClose={() => {
            setShowReportModal(false);
            setReportCommentId(null);
          }}
        />
      )}

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
