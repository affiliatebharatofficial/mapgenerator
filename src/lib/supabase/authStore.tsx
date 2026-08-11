import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FantasyMap } from '../../types/map';
import { loadMapFromLocalStorage } from '../storage/mapStorage';

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

  useEffect(() => {
    // Check if there is an existing map created in guest local storage
    const guestMap = loadMapFromLocalStorage();
    if (user && guestMap && !guestMap.id.includes('migrated')) {
      setHasGuestMap(true);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email.trim() || !password) {
        return { success: false, error: 'Please enter valid email and password.' };
      }

      const mockUserId = `user_${Date.now().toString(36)}`;
      const mockUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';

      const newUser: UserAccount = { id: mockUserId, email, role };
      const newProfile: UserProfile = {
        id: mockUserId,
        user_id: mockUserId,
        display_name: email.split('@')[0],
        username: mockUsername,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${mockUsername}`,
        bio: role === 'admin' ? 'System Administrator & Master Cartographer' : 'Cartographer & Worldbuilder on CreateFantasyMap.com',
        role,
        created_at: new Date().toISOString()
      };

      setUser(newUser);
      setProfile(newProfile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));

      return { success: true };
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

      const mockUserId = `user_${Date.now().toString(36)}`;
      const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';
      const newUser: UserAccount = { id: mockUserId, email, role };
      const newProfile: UserProfile = {
        id: mockUserId,
        user_id: mockUserId,
        display_name: displayName || cleanUsername,
        username: cleanUsername,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        bio: role === 'admin' ? 'System Administrator & Master Cartographer' : 'Cartographer & Worldbuilder on CreateFantasyMap.com',
        role,
        created_at: new Date().toISOString()
      };

      setUser(newUser);
      setProfile(newProfile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const mockUserId = `user_google_${Date.now().toString(36)}`;
    const newUser: UserAccount = { id: mockUserId, email: 'explorer@createfantasymap.com' };
    const newProfile: UserProfile = {
      id: mockUserId,
      user_id: mockUserId,
      display_name: 'Fantasy Explorer',
      username: 'fantasy_explorer',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=fantasy_explorer',
      bio: 'Creating worlds with CreateFantasyMap AI Engine',
      created_at: new Date().toISOString()
    };

    setUser(newUser);
    setProfile(newProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfile));
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
  };

  const resetPassword = async (email: string) => {
    return { success: true, message: `Password reset link sent to ${email}` };
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
