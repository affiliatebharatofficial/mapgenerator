import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FantasyMap } from '../../types/map';
import { loadMapFromLocalStorage } from '../storage/mapStorage';
import { supabase, isSupabaseConfigured } from './client';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role?: 'admin' | 'user';
  created_at: string;
}

export interface UserAccount {
  id: string;
  email: string;
  role?: 'admin' | 'user';
}

export const ADMIN_EMAILS = ['affiliatebharatofficial@gmail.com'];

interface AuthContextType {
  user: UserAccount | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (displayName: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean }>;
  deleteAccount: () => Promise<void>;
  hasGuestMap: boolean;
  migrateGuestMapToAccount: () => FantasyMap | null;
  dismissGuestMapMigration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'createfantasymap_auth_user';
const LOCAL_PROFILE_KEY = 'createfantasymap_auth_profile';

const RESERVED_USERNAMES = ['admin', 'support', 'createfantasymap', 'api', 'dashboard', 'login', 'signup', 'settings', 'gallery'];

const ALL_USERS_KEY = 'createfantasymap_registered_users_list';

function saveToUserRegistry(account: UserAccount, prof: UserProfile) {
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY);
    const usersList: Array<any> = raw ? JSON.parse(raw) : [];
    const idx = usersList.findIndex((u) => u.id === account.id || u.email === account.email);
    const record = {
      id: account.id,
      email: account.email,
      displayName: prof.display_name,
      username: prof.username,
      role: account.role || 'user',
      created_at: prof.created_at || new Date().toISOString()
    };
    if (idx >= 0) {
      usersList[idx] = { ...usersList[idx], ...record };
    } else {
      usersList.push(record);
    }
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(usersList));
  } catch {
    // ignore
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasGuestMap, setHasGuestMap] = useState<boolean>(false);

  // Helper to map Supabase user to UserAccount and UserProfile
  const handleSupabaseUser = useCallback((suUser: any) => {
    if (!suUser) return;
    const email = suUser.email || '';
    const name =
      suUser.user_metadata?.full_name ||
      suUser.user_metadata?.name ||
      suUser.user_metadata?.display_name ||
      (email ? email.split('@')[0] : 'Adventurer');
    const username =
      suUser.user_metadata?.preferred_username ||
      suUser.user_metadata?.username ||
      (email ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') : `user_${suUser.id.substring(0, 8)}`);
    const avatar =
      suUser.user_metadata?.avatar_url ||
      suUser.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
    const role: 'admin' | 'user' = (email && ADMIN_EMAILS.includes(email.toLowerCase())) ? 'admin' : 'user';

    const newUser: UserAccount = { id: suUser.id, email, role };
    const newProfile: UserProfile = {
      id: suUser.id,
      user_id: suUser.id,
      display_name: name,
      username,
      avatar_url: avatar,
      bio: role === 'admin' ? 'System Administrator & Master Cartographer' : 'Cartographer & Worldbuilder on CreateFantasyMap',
      role,
      created_at: suUser.created_at || new Date().toISOString()
    };

    setUser(newUser);
    setProfile(newProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));
    saveToUserRegistry(newUser, newProfile);
  }, []);

  useEffect(() => {
    // Check if there is an existing map created in guest local storage
    const guestMap = loadMapFromLocalStorage();
    if (user && guestMap && !guestMap.id.includes('migrated')) {
      setHasGuestMap(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Listen to Supabase auth state changes (OAuth redirect, session refresh, signin)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error fetching Supabase session:', error);
      }
      if (session?.user) {
        handleSupabaseUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        localStorage.removeItem(LOCAL_USER_KEY);
        localStorage.removeItem(LOCAL_PROFILE_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSupabaseUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email.trim() || !password) {
        return { success: false, error: 'Please enter valid email and password.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        handleSupabaseUser(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (displayName: string, username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

      if (!cleanUsername || cleanUsername.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters long (letters, numbers, underscore).' };
      }

      if (RESERVED_USERNAMES.includes(cleanUsername)) {
        return { success: false, error: 'This username is reserved. Please choose another username.' };
      }

      if (!email.includes('@') || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: displayName || cleanUsername,
            username: cleanUsername,
            display_name: displayName || cleanUsername
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        handleSupabaseUser(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Signup failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const currentOrigin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentOrigin
        }
      });

      if (error) {
        console.error('Supabase Google OAuth error:', error);
        throw error;
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase sign out error:', err);
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: `Password reset link sent to ${email}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send password reset link.' };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { success: false };
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    return { success: true };
  };

  const deleteAccount = async () => {
    logout();
  };

  const migrateGuestMapToAccount = () => {
    const guestMap = loadMapFromLocalStorage();
    if (!guestMap) return null;
    setHasGuestMap(false);
    return guestMap;
  };

  const dismissGuestMapMigration = () => {
    setHasGuestMap(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isAdmin: ADMIN_EMAILS.includes(user?.email?.toLowerCase() || '') || profile?.role === 'admin',
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfile,
        deleteAccount,
        hasGuestMap,
        migrateGuestMapToAccount,
        dismissGuestMapMigration
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
