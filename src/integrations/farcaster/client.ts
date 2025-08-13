/**
 * Farcaster client - exports browser-compatible API client
 * Avoids Node.js dependencies that cause issues in browser
 */

export { getFarcasterClient, default as FarcasterClient } from './api-client';