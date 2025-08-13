/**
 * Cloud storage service for production user data persistence
 * Falls back to localStorage in development
 */

import type { StoredUser, StoredTrack } from '@/utils/localStorage';

const API_BASE = import.meta.env.PROD ? 'https://your-app.vercel.app/api' : '/api';

class CloudStorageService {
  private isProduction = import.meta.env.PROD;
  
  /**
   * Save user data to cloud storage
   */
  async saveUser(user: StoredUser): Promise<void> {
    if (!this.isProduction) {
      // Development: use localStorage
      const { userStorage } = await import('@/utils/localStorage');
      userStorage.save(user);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${user.fid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error(`Failed to save user: ${response.status}`);
      }

      console.log('✅ User data saved to cloud storage');
    } catch (error) {
      console.error('❌ Failed to save user to cloud:', error);
      // Fallback to localStorage if cloud fails
      const { userStorage } = await import('@/utils/localStorage');
      userStorage.save(user);
      console.log('📱 Fallback: saved to localStorage');
    }
  }

  /**
   * Get user data from cloud storage
   */
  async getUser(fid: string): Promise<StoredUser | null> {
    if (!this.isProduction) {
      // Development: use localStorage
      const { userStorage } = await import('@/utils/localStorage');
      return userStorage.get();
    }

    try {
      const response = await fetch(`${API_BASE}/users/${fid}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.status}`);
      }

      const userData = await response.json();
      console.log('✅ User data loaded from cloud storage');
      return userData;
    } catch (error) {
      console.error('❌ Failed to load user from cloud:', error);
      // Fallback to localStorage if cloud fails
      const { userStorage } = await import('@/utils/localStorage');
      const localUser = userStorage.get();
      if (localUser) {
        console.log('📱 Fallback: loaded from localStorage');
      }
      return localUser;
    }
  }

  /**
   * Delete user data from cloud storage
   */
  async deleteUser(fid: string): Promise<void> {
    if (!this.isProduction) {
      // Development: use localStorage
      const { userStorage } = await import('@/utils/localStorage');
      userStorage.remove();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${fid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }

      console.log('✅ User data deleted from cloud storage');
    } catch (error) {
      console.error('❌ Failed to delete user from cloud:', error);
      // Still clear localStorage
      const { userStorage } = await import('@/utils/localStorage');
      userStorage.remove();
    }
  }

  /**
   * Save track data to cloud storage
   */
  async saveTrack(fid: string, track: StoredTrack): Promise<void> {
    if (!this.isProduction) {
      // Development: use localStorage
      const { trackStorage } = await import('@/utils/localStorage');
      trackStorage.addUserTrack(track);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/tracks/${fid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(track),
      });

      if (!response.ok) {
        throw new Error(`Failed to save track: ${response.status}`);
      }

      console.log('✅ Track saved to cloud storage');
    } catch (error) {
      console.error('❌ Failed to save track to cloud:', error);
      // Fallback to localStorage
      const { trackStorage } = await import('@/utils/localStorage');
      trackStorage.addUserTrack(track);
      console.log('📱 Fallback: saved track to localStorage');
    }
  }

  /**
   * Get user's tracks from cloud storage
   */
  async getTracks(fid: string): Promise<StoredTrack[]> {
    if (!this.isProduction) {
      // Development: use localStorage
      const { trackStorage } = await import('@/utils/localStorage');
      return trackStorage.getUserTracks();
    }

    try {
      const response = await fetch(`${API_BASE}/tracks/${fid}`);
      
      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to get tracks: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tracks loaded from cloud storage');
      return data.tracks || [];
    } catch (error) {
      console.error('❌ Failed to load tracks from cloud:', error);
      // Fallback to localStorage
      const { trackStorage } = await import('@/utils/localStorage');
      const localTracks = trackStorage.getUserTracks();
      if (localTracks.length > 0) {
        console.log('📱 Fallback: loaded tracks from localStorage');
      }
      return localTracks;
    }
  }
}

export const cloudStorage = new CloudStorageService();