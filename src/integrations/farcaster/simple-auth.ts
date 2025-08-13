/**
 * Simplified Farcaster auth alternatives for free accounts
 */

import { getFarcasterClient } from './client';
import type { FarcasterUser } from './types';

/**
 * Option 2: Username + Verification approach
 * User enters username, we verify they control the wallet
 */
export async function signInWithUsernameVerification(
  username: string, 
  walletAddress: string
): Promise<FarcasterUser> {
  
  const client = getFarcasterClient();
  const user = await client.getUserByUsername(username);
  
  if (!user) {
    throw new Error(`Farcaster user @${username} not found`);
  }
  
  const verifiedAddresses = user.verifications.map(addr => addr.toLowerCase());
  const walletLower = walletAddress.toLowerCase();
  
  if (!verifiedAddresses.includes(walletLower)) {
    throw new Error(
      `Wallet ${walletAddress} is not verified with @${username}.\n\n` +
      'Please verify this wallet address on your Farcaster profile at warpcast.com/~/settings/verified-addresses'
    );
  }
  
  return user;
}

/**
 * Option 3: FID-based auth (if user knows their FID)
 * Some power users know their FID number
 */
export async function signInWithFidVerification(
  fid: number, 
  walletAddress: string
): Promise<FarcasterUser> {
  
  const client = getFarcasterClient();
  const user = await client.getUserByFid(fid);
  
  if (!user) {
    throw new Error(`Farcaster user with FID ${fid} not found`);
  }
  
  const verifiedAddresses = user.verifications.map(addr => addr.toLowerCase());
  const walletLower = walletAddress.toLowerCase();
  
  if (!verifiedAddresses.includes(walletLower)) {
    throw new Error(
      `Wallet ${walletAddress} is not verified with FID ${fid} (@${user.username}).\n\n` +
      'Please verify this wallet address on your Farcaster profile.'
    );
  }
  
  return user;
}