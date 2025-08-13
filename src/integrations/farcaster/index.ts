/**
 * Farcaster Integration
 * Public API exports for SoundProof Farcaster integration
 */

// Client exports
export { default as FarcasterClient, getFarcasterClient, initializeFarcasterClient } from './client';

// Type exports
export type {
  FarcasterUser,
  FarcasterCast,
  FarcasterEmbed,
  FarcasterReaction,
  FarcasterFollow,
  FarcasterChannel,
  PlaylistCast,
  PlaylistTrack,
  FarcasterAuthResult,
  FarcasterAuthRequest,
  FarcasterApiResponse,
  FarcasterError,
  RateLimitConfig,
  RateLimitStatus,
} from './types';

// Utility exports
export {
  formatFid,
  parseFid,
  getWarpcastProfileUrl,
  getWarpcastCastUrl,
  hasEthereumVerification,
  getPrimaryEthereumAddress,
  getDisplayName,
  getAvatarUrl,
  extractMentions,
  extractUrls,
  truncateCastText,
  formatCastTimestamp,
  isReply,
  isChannelCast,
  createPlaylistEmbed,
  formatPlaylistCastText,
  formatPlaylistDuration,
  isValidFarcasterUsername,
  isValidFid,
  calculatePlaylistSimilarity,
  containsSoundProofLinks,
  generateReferralParams,
  parseReferralParams,
} from './utils';