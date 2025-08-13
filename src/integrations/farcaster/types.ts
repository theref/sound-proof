/**
 * Farcaster integration TypeScript definitions
 * Based on Farcaster protocol and Neynar API types
 */

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
  };
  profile: {
    bio: {
      text: string;
    };
  };
  followerCount: number;
  followingCount: number;
  verifications: string[];
  activeStatus: string;
}

export interface FarcasterCast {
  hash: string;
  parentHash?: string;
  parentUrl?: string;
  rootParentUrl?: string;
  threadHash: string;
  author: FarcasterUser;
  text: string;
  timestamp: string;
  embeds: FarcasterEmbed[];
  reactions: {
    likesCount: number;
    recastsCount: number;
    likes: FarcasterReaction[];
    recasts: FarcasterReaction[];
  };
  replies: {
    count: number;
  };
  channel?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export interface FarcasterEmbed {
  url?: string;
  castId?: {
    fid: number;
    hash: string;
  };
  metadata?: {
    image?: {
      url: string;
    };
    title?: string;
    description?: string;
  };
}

export interface FarcasterReaction {
  fid: number;
  fname: string;
}

export interface FarcasterFollow {
  user: FarcasterUser;
  followedAt: string;
}

export interface FarcasterChannel {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: number;
  followerCount: number;
  hostFids: number[];
}

// Playlist-related types for Farcaster integration
export interface PlaylistCast {
  playlistId: string;
  curatorFid: number;
  castHash: string;
  tracks: PlaylistTrack[];
  title: string;
  description?: string;
  coverImageUrl?: string;
  publishedAt: string;
}

export interface PlaylistTrack {
  trackId: string;
  title: string;
  artist: string;
  duration: number;
  position: number;
}

// Authentication types
export interface FarcasterAuthResult {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  verifications: string[];
  signature: string;
  message: string;
}

export interface FarcasterAuthRequest {
  domain: string;
  nonce: string;
  uri: string;
  version: string;
  chainId: number;
  issuedAt: string;
  expirationTime?: string;
  requestId?: string;
}

// API response types
export interface FarcasterApiResponse<T> {
  result: T;
  next?: {
    cursor: string;
  };
}

export interface FarcasterError {
  code: string;
  message: string;
  details?: unknown;
}

// Rate limiting types
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfter?: number;
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  isLimited: boolean;
}