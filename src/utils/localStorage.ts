/**
 * Local storage utilities for SoundProof MVP
 * Simple storage for user data and app state
 */

import type { FarcasterUser } from '@/integrations/farcaster/types';

// Storage keys
const STORAGE_KEYS = {
  USER: 'soundproof_user',
  USER_TRACKS: 'soundproof_user_tracks',
  FEED_TRACKS: 'soundproof_feed_tracks',
  SETTINGS: 'soundproof_settings',
} as const;

export interface StoredUser extends FarcasterUser {
  walletAddress?: string;
  lastLogin: string;
}

export interface StoredTrack {
  id: string;
  title: string;
  artist: string;
  uploader: string; // FID as string
  uploaderUsername: string;
  cid: string; // Lighthouse IPFS hash
  metadataCid?: string; // IPFS hash for additional metadata
  accessRule: {
    type: 'public' | 'erc20' | 'erc721';
    contractAddress?: string;
    minBalance?: string;
  };
  duration?: number;
  genre?: string;
  description?: string;
  coverImageCid?: string;
  isEncrypted: boolean;
  uploadedAt: string;
  playCount: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  autoplay: boolean;
  volume: number;
  lastActiveView: 'feed' | 'upload' | 'profile';
}

// User management
export const userStorage = {
  save: (user: StoredUser): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  },

  get: (): StoredUser | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get user from localStorage:', error);
      return null;
    }
  },

  remove: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  isLoggedIn: (): boolean => {
    return userStorage.get() !== null;
  },
};

// Track management
export const trackStorage = {
  // Save user's uploaded tracks
  saveUserTracks: (tracks: StoredTrack[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_TRACKS, JSON.stringify(tracks));
    } catch (error) {
      console.error('Failed to save user tracks:', error);
    }
  },

  // Get user's uploaded tracks
  getUserTracks: (): StoredTrack[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_TRACKS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get user tracks:', error);
      return [];
    }
  },

  // Add a new track to user's uploads
  addUserTrack: (track: StoredTrack): void => {
    const tracks = trackStorage.getUserTracks();
    tracks.unshift(track); // Add to beginning
    trackStorage.saveUserTracks(tracks);
  },

  // Save discovered tracks (feed)
  saveFeedTracks: (tracks: StoredTrack[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEED_TRACKS, JSON.stringify(tracks));
    } catch (error) {
      console.error('Failed to save feed tracks:', error);
    }
  },

  // Get discovered tracks (feed)
  getFeedTracks: (): StoredTrack[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEED_TRACKS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get feed tracks:', error);
      return [];
    }
  },

  // Add a track to feed (when discovered)
  addFeedTrack: (track: StoredTrack): void => {
    const tracks = trackStorage.getFeedTracks();
    // Avoid duplicates
    if (!tracks.find(t => t.id === track.id)) {
      tracks.unshift(track);
      // Keep only last 100 tracks to avoid storage bloat
      if (tracks.length > 100) {
        tracks.splice(100);
      }
      trackStorage.saveFeedTracks(tracks);
    }
  },

  // Update play count
  incrementPlayCount: (trackId: string): void => {
    // Update in user tracks
    const userTracks = trackStorage.getUserTracks();
    const userTrackIndex = userTracks.findIndex(t => t.id === trackId);
    if (userTrackIndex >= 0) {
      userTracks[userTrackIndex].playCount += 1;
      trackStorage.saveUserTracks(userTracks);
    }

    // Update in feed tracks
    const feedTracks = trackStorage.getFeedTracks();
    const feedTrackIndex = feedTracks.findIndex(t => t.id === trackId);
    if (feedTrackIndex >= 0) {
      feedTracks[feedTrackIndex].playCount += 1;
      trackStorage.saveFeedTracks(feedTracks);
    }
  },

  // Get all tracks (user + feed combined)
  getAllTracks: (): StoredTrack[] => {
    const userTracks = trackStorage.getUserTracks();
    const feedTracks = trackStorage.getFeedTracks();
    
    // Combine and deduplicate
    const allTracks = [...userTracks];
    feedTracks.forEach(feedTrack => {
      if (!allTracks.find(t => t.id === feedTrack.id)) {
        allTracks.push(feedTrack);
      }
    });

    // Sort by upload date (newest first)
    return allTracks.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  },
};

// Settings management
export const settingsStorage = {
  save: (settings: Partial<AppSettings>): void => {
    try {
      const current = settingsStorage.get();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  get: (): AppSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const defaults: AppSettings = {
        theme: 'light',
        autoplay: true,
        volume: 1,
        lastActiveView: 'feed',
      };
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {
        theme: 'light',
        autoplay: true,
        volume: 1,
        lastActiveView: 'feed',
      };
    }
  },
};

// Utility functions
export const storage = {
  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  getStorageInfo: () => {
    const info = {
      hasUser: userStorage.isLoggedIn(),
      userTrackCount: trackStorage.getUserTracks().length,
      feedTrackCount: trackStorage.getFeedTracks().length,
      settings: settingsStorage.get(),
    };
    return info;
  },

  // Export all data for backup
  exportData: () => {
    return {
      user: userStorage.get(),
      userTracks: trackStorage.getUserTracks(),
      feedTracks: trackStorage.getFeedTracks(),
      settings: settingsStorage.get(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Import data from backup
  importData: (data: any): boolean => {
    try {
      if (data.user) userStorage.save(data.user);
      if (data.userTracks) trackStorage.saveUserTracks(data.userTracks);
      if (data.feedTracks) trackStorage.saveFeedTracks(data.feedTracks);
      if (data.settings) settingsStorage.save(data.settings);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },
};

// Generate unique ID for tracks
export const generateTrackId = (): string => {
  return `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};