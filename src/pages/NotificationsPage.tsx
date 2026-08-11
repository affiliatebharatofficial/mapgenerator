import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Bell, CheckCheck, UserPlus, Heart, MessageSquare, GitFork, Bookmark } from 'lucide-react';
import { CommunityService } from '../lib/supabase/communityService';
import type { Notification } from '../types/community';
import { useAuth } from '../lib/supabase/authStore';

interface NotificationsPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
  onNavigateProfile: (username: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onNavigateCreate,
  onNavigateHome,
  onNavigateProfile
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'user_master_cartographer';

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => {
    const notifs = CommunityService.getUserNotifications(userId);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkAllRead = () => {
    CommunityService.markAllAsRead(userId);
    loadNotifications();
  };

  const getIcon = (type: Notification['type']) => {
    if (type === 'follow') return <UserPlus className="w-4 h-4 text-sky-400" />;
    if (type === 'map_like' || type === 'world_like') return <Heart className="w-4 h-4 text-rose-400" />;
    if (type === 'comment') return <MessageSquare className="w-4 h-4 text-amber-400" />;
    if (type === 'remix') return <GitFork className="w-4 h-4 text-purple-400" />;
    return <Bookmark className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="font-cinzel font-bold text-2xl text-slate-100">Notifications Center</h1>
              <p className="text-xs text-slate-400">Activity on your published maps, worlds, and profile.</p>
            </div>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 font-cinzel rounded-2xl border border-slate-800">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  CommunityService.markAsRead(n.id);
                  if (n.type === 'follow') onNavigateProfile(n.actor_username);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  !n.read_at ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950/80 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">{getIcon(n.type)}</div>
                  <div>
                    <span className="font-bold text-xs text-slate-100">{n.actor_name}</span>{' '}
                    <span className="text-xs text-slate-300">{n.message}</span>
                    <span className="text-[10px] font-mono text-slate-500 block pt-0.5">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!n.read_at && <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
