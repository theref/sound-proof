/**
 * IPFS Metadata Service for SoundProof MVP
 * Stores track metadata as JSON files on IPFS via Pinata/Lighthouse
 */

import type { StoredTrack } from '@/utils/localStorage';

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  uploader: string;
  uploaderUsername: string;
  description?: string;
  genre?: string;
  tags?: string[];
  duration?: number;
  bpm?: number;
  key?: string;
  coverImageCid?: string;
  waveformCid?: string;
  socialLinks?: {
    farcaster?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  accessRule: StoredTrack['accessRule'];
  uploadedAt: string;
  version: string; // For future metadata updates
}

export interface PlaylistMetadata {
  id: string;
  title: string;
  description?: string;
  curator: string;
  curatorUsername: string;
  tracks: string[]; // Array of track IDs
  coverImageCid?: string;
  isPublic: boolean;
  farcasterCastHash?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

/**
 * Save track metadata to IPFS
 * Returns the CID of the stored metadata
 */
export const saveTrackMetadata = async (metadata: TrackMetadata): Promise<string> => {
  try {
    // For MVP, we'll use the Lighthouse service that's already configured
    const metadataJSON = JSON.stringify(metadata, null, 2);
    const blob = new Blob([metadataJSON], { type: 'application/json' });
    
    // Use Lighthouse API directly
    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY || import.meta.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('Lighthouse API key not found');
    }
    
    const formData = new FormData();
    formData.append('file', blob, `${metadata.id}_metadata.json`);
    
    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload metadata: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.Hash;
    
  } catch (error) {
    console.error('Failed to save track metadata to IPFS:', error);
    throw error;
  }
};

/**
 * Fetch track metadata from IPFS
 */
export const getTrackMetadata = async (cid: string): Promise<TrackMetadata | null> => {
  try {
    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const metadata: TrackMetadata = await response.json();
    return metadata;
    
  } catch (error) {
    console.error('Failed to fetch track metadata from IPFS:', error);
    return null;
  }
};

/**
 * Save playlist metadata to IPFS
 */
export const savePlaylistMetadata = async (metadata: PlaylistMetadata): Promise<string> => {
  try {
    const metadataJSON = JSON.stringify(metadata, null, 2);
    const blob = new Blob([metadataJSON], { type: 'application/json' });
    
    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY || import.meta.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('Lighthouse API key not found');
    }
    
    const formData = new FormData();
    formData.append('file', blob, `playlist_${metadata.id}_metadata.json`);
    
    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload playlist metadata: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.Hash;
    
  } catch (error) {
    console.error('Failed to save playlist metadata to IPFS:', error);
    throw error;
  }
};

/**
 * Fetch playlist metadata from IPFS
 */
export const getPlaylistMetadata = async (cid: string): Promise<PlaylistMetadata | null> => {
  try {
    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist metadata: ${response.statusText}`);
    }
    
    const metadata: PlaylistMetadata = await response.json();
    return metadata;
    
  } catch (error) {
    console.error('Failed to fetch playlist metadata from IPFS:', error);
    return null;
  }
};

/**
 * Create track metadata from StoredTrack
 */
export const createTrackMetadata = (track: StoredTrack, additionalData?: Partial<TrackMetadata>): TrackMetadata => {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    uploader: track.uploader,
    uploaderUsername: track.uploaderUsername,
    description: track.description,
    genre: track.genre,
    duration: track.duration,
    coverImageCid: track.coverImageCid,
    accessRule: track.accessRule,
    uploadedAt: track.uploadedAt,
    version: '1.0',
    ...additionalData,
  };
};

/**
 * Update existing metadata with new data
 */
export const updateTrackMetadata = async (
  currentCid: string, 
  updates: Partial<TrackMetadata>
): Promise<string> => {
  try {
    // Fetch current metadata
    const currentMetadata = await getTrackMetadata(currentCid);
    if (!currentMetadata) {
      throw new Error('Current metadata not found');
    }
    
    // Merge with updates
    const updatedMetadata: TrackMetadata = {
      ...currentMetadata,
      ...updates,
      version: '1.1', // Increment version for updates
    };
    
    // Save updated metadata
    return await saveTrackMetadata(updatedMetadata);
    
  } catch (error) {
    console.error('Failed to update track metadata:', error);
    throw error;
  }
};

/**
 * Generate a simple playlist from user's tracks
 */
export const generateUserPlaylist = (
  userId: string,
  username: string,
  tracks: StoredTrack[],
  title: string = 'My Tracks'
): PlaylistMetadata => {
  return {
    id: `playlist_${userId}_${Date.now()}`,
    title,
    description: `Tracks uploaded by @${username}`,
    curator: userId,
    curatorUsername: username,
    tracks: tracks.map(t => t.id),
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Search function for local development (since we don't have a backend)
 */
export const searchMetadata = (
  tracks: StoredTrack[],
  query: string
): StoredTrack[] => {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return tracks;
  
  return tracks.filter(track => 
    track.title.toLowerCase().includes(searchTerm) ||
    track.artist.toLowerCase().includes(searchTerm) ||
    track.uploaderUsername.toLowerCase().includes(searchTerm) ||
    track.genre?.toLowerCase().includes(searchTerm) ||
    track.description?.toLowerCase().includes(searchTerm)
  );
};