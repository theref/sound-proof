/**
 * Farcaster utility functions
 * Helper functions for common Farcaster operations and data transformations
 */

import type {
  FarcasterUser,
  FarcasterCast,
  PlaylistCast,
  PlaylistTrack,
  FarcasterEmbed,
} from './types';

/**
 * Format FID for display (e.g., "fid:12345")
 */
export function formatFid(fid: number): string {
  return `fid:${fid}`;
}

/**
 * Extract FID from formatted string (e.g., "fid:12345" -> 12345)
 */
export function parseFid(fidString: string): number | null {
  const match = fidString.match(/^fid:(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Generate Warpcast profile URL from username or FID
 */
export function getWarpcastProfileUrl(identifier: string | number): string {
  if (typeof identifier === 'number') {
    return `https://warpcast.com/~/profiles/${identifier}`;
  }
  // Remove @ if present
  const username = identifier.replace(/^@/, '');
  return `https://warpcast.com/${username}`;
}

/**
 * Generate Warpcast cast URL from hash
 */
export function getWarpcastCastUrl(hash: string): string {
  return `https://warpcast.com/~/conversations/${hash}`;
}

/**
 * Check if a user has verified their Ethereum address
 */
export function hasEthereumVerification(user: FarcasterUser): boolean {
  return user.verifications.some(addr => 
    addr.startsWith('0x') && addr.length === 42
  );
}

/**
 * Get the first verified Ethereum address for a user
 */
export function getPrimaryEthereumAddress(user: FarcasterUser): string | null {
  const ethAddress = user.verifications.find(addr => 
    addr.startsWith('0x') && addr.length === 42
  );
  return ethAddress || null;
}

/**
 * Format user display name with fallback to username
 */
export function getDisplayName(user: FarcasterUser): string {
  return user.displayName || user.username || `User ${user.fid}`;
}

/**
 * Get user avatar URL with fallback
 */
export function getAvatarUrl(user: FarcasterUser, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (user.pfp?.url) {
    // Neynar provides different sizes
    const sizeParam = size === 'small' ? '?size=32' : size === 'large' ? '?size=256' : '?size=128';
    return user.pfp.url + sizeParam;
  }
  
  // Fallback to a default avatar service
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(getDisplayName(user))}&size=${size === 'small' ? 32 : size === 'large' ? 256 : 128}`;
}

/**
 * Extract mentions from cast text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

/**
 * Extract URLs from cast text
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}

/**
 * Truncate cast text for preview
 */
export function truncateCastText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Format timestamp for display
 */
export function formatCastTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString();
}

/**
 * Check if a cast is a reply
 */
export function isReply(cast: FarcasterCast): boolean {
  return !!(cast.parentHash || cast.parentUrl);
}

/**
 * Check if a cast is in a channel
 */
export function isChannelCast(cast: FarcasterCast): boolean {
  return !!cast.channel;
}

/**
 * Create playlist embed for Farcaster cast
 */
export function createPlaylistEmbed(
  playlistId: string,
  title: string,
  tracks: PlaylistTrack[],
  coverImageUrl?: string
): FarcasterEmbed {
  const playlistUrl = `${window.location.origin}/playlist/${playlistId}`;
  
  return {
    url: playlistUrl,
    metadata: {
      title: `🎵 ${title}`,
      description: `${tracks.length} tracks • ${formatPlaylistDuration(tracks)} • Curated playlist`,
      image: coverImageUrl ? { url: coverImageUrl } : undefined,
    },
  };
}

/**
 * Format playlist cast text
 */
export function formatPlaylistCastText(
  title: string,
  tracks: PlaylistTrack[],
  curatorName?: string
): string {
  const trackList = tracks
    .slice(0, 5) // Show first 5 tracks
    .map((track, index) => `${index + 1}. ${track.artist} - ${track.title}`)
    .join('\n');
  
  const remainingCount = tracks.length - 5;
  const remainingText = remainingCount > 0 ? `\n+${remainingCount} more tracks` : '';
  
  const curatorText = curatorName ? `\nCurated by ${curatorName}` : '';
  
  return `🎵 ${title}\n\n${trackList}${remainingText}${curatorText}`;
}

/**
 * Calculate total playlist duration
 */
export function formatPlaylistDuration(tracks: PlaylistTrack[]): string {
  const totalSeconds = tracks.reduce((sum, track) => sum + track.duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Validate Farcaster username format
 */
export function isValidFarcasterUsername(username: string): boolean {
  // Farcaster usernames are 1-16 characters, alphanumeric and hyphens
  const usernameRegex = /^[a-zA-Z0-9-]{1,16}$/;
  return usernameRegex.test(username);
}

/**
 * Validate FID format
 */
export function isValidFid(fid: number): boolean {
  return Number.isInteger(fid) && fid > 0 && fid < 2**32;
}

/**
 * Extract track IDs from playlist cast text (for clone detection)
 */
export function extractTrackIdsFromCast(castText: string): string[] {
  // This would need to be implemented based on how track IDs are embedded in casts
  // For now, return empty array as placeholder
  return [];
}

/**
 * Calculate playlist similarity for clone detection
 */
export function calculatePlaylistSimilarity(
  playlist1: PlaylistTrack[],
  playlist2: PlaylistTrack[]
): number {
  if (playlist1.length === 0 || playlist2.length === 0) return 0;
  
  const set1 = new Set(playlist1.map(track => track.trackId));
  const set2 = new Set(playlist2.map(track => track.trackId));
  
  const intersection = new Set([...set1].filter(id => set2.has(id)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

/**
 * Check if cast contains SoundProof track links
 */
export function containsSoundProofLinks(cast: FarcasterCast): boolean {
  const text = cast.text.toLowerCase();
  const embeds = cast.embeds || [];
  
  // Check text for SoundProof domains
  const soundProofDomains = ['soundproof.app', 'sound-proof.com']; // Update with actual domains
  const hasTextLink = soundProofDomains.some(domain => text.includes(domain));
  
  // Check embeds for SoundProof URLs
  const hasEmbedLink = embeds.some(embed => 
    embed.url && soundProofDomains.some(domain => embed.url!.includes(domain))
  );
  
  return hasTextLink || hasEmbedLink;
}

/**
 * Generate referral tracking parameters for playlist shares
 */
export function generateReferralParams(curatorFid: number, playlistId: string): string {
  return `?ref=${curatorFid}&playlist=${playlistId}&source=farcaster`;
}

/**
 * Parse referral parameters from URL
 */
export function parseReferralParams(url: string): {
  curatorFid?: number;
  playlistId?: string;
  source?: string;
} {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);
  
  return {
    curatorFid: params.get('ref') ? parseInt(params.get('ref')!, 10) : undefined,
    playlistId: params.get('playlist') || undefined,
    source: params.get('source') || undefined,
  };
}