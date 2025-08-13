/**
 * Direct Neynar REST API client for browser environments
 * Replaces the Node.js SDK which has compatibility issues in browsers
 */

import type {
  FarcasterUser,
  FarcasterCast,
  FarcasterFollow,
  FarcasterError,
  FarcasterApiResponse,
} from './types';

const NEYNAR_API_BASE = 'https://api.neynar.com/v2/farcaster';

class NeynarAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Neynar API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Make API request with proper headers
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${NEYNAR_API_BASE}${endpoint}`;
    
    try {
      console.log(`🌐 API Request: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'api_key': this.apiKey,
          'accept': 'application/json',
          ...options.headers,
        },
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText || 'Unknown error' };
        }
        
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API Data:', data);
      
      return data;
    } catch (error) {
      console.error(`Neynar API error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get user by FID
   */
  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    try {
      const response = await this.request<{ users: any[] }>(`/user/bulk?fids=${fid}`);
      
      if (!response.users || response.users.length === 0) {
        return null;
      }

      return this.transformUser(response.users[0]);
    } catch (error) {
      console.error(`Failed to get user by FID ${fid}:`, error);
      return null;
    }
  }

  /**
   * Get user by username - try multiple endpoint patterns
   */
  async getUserByUsername(username: string): Promise<FarcasterUser | null> {
    try {
      console.log(`🔍 Looking up username: ${username}`);
      
      // Try different Neynar v2 endpoint patterns
      const endpoints = [
        `/user/by_username?username=${username}`,
        `/user/by-username?username=${username}`,
        `/user/search?username=${username}`,
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          const response = await this.request<any>(endpoint);
          
          // Handle different response structures
          let user = null;
          if (response.user) {
            user = response.user;
          } else if (response.result?.user) {
            user = response.result.user;
          } else if (response.users && response.users.length > 0) {
            user = response.users[0];
          }
          
          if (user) {
            console.log(`✅ Found user @${username} via ${endpoint}:`, user.display_name || user.displayName);
            return this.transformUser(user);
          }
          
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError);
          continue; // Try next endpoint
        }
      }
      
      console.log(`❌ User @${username} not found in any endpoint`);
      return null;
      
    } catch (error) {
      console.error(`Failed to get user by username ${username}:`, error);
      return null;
    }
  }

  /**
   * Get user's casts
   */
  async getUserCasts(fid: number, limit = 25, cursor?: string): Promise<FarcasterApiResponse<FarcasterCast[]>> {
    const params = new URLSearchParams({
      fid: fid.toString(),
      limit: limit.toString(),
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await this.request<{ casts: any[], next?: { cursor: string } }>(
      `/feed/user/casts?${params}`
    );

    return {
      result: response.casts.map(cast => this.transformCast(cast)),
      next: response.next?.cursor,
    };
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(fid: number, limit = 20, cursor?: string): Promise<FarcasterApiResponse<FarcasterFollow[]>> {
    const params = new URLSearchParams({
      fid: fid.toString(),
      limit: limit.toString(),
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await this.request<{ users: any[], next?: { cursor: string } }>(
      `/followers?${params}`
    );

    return {
      result: response.users.map(user => ({
        user: this.transformUser(user),
        followedAt: new Date().toISOString(),
      })),
      next: response.next?.cursor,
    };
  }

  /**
   * Get user's following
   */
  async getUserFollowing(fid: number, limit = 20, cursor?: string): Promise<FarcasterApiResponse<FarcasterFollow[]>> {
    const params = new URLSearchParams({
      fid: fid.toString(),
      limit: limit.toString(),
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await this.request<{ users: any[], next?: { cursor: string } }>(
      `/following?${params}`
    );

    return {
      result: response.users.map(user => ({
        user: this.transformUser(user),
        followedAt: new Date().toISOString(),
      })),
      next: response.next?.cursor,
    };
  }

  /**
   * Transform raw API user data
   */
  private transformUser(rawUser: any): FarcasterUser {
    return {
      fid: rawUser.fid,
      username: rawUser.username || '',
      displayName: rawUser.display_name || rawUser.username || '',
      pfp: {
        url: rawUser.pfp_url || '',
      },
      profile: {
        bio: {
          text: rawUser.profile?.bio?.text || '',
        },
      },
      followerCount: rawUser.follower_count || 0,
      followingCount: rawUser.following_count || 0,
      verifications: rawUser.verified_addresses?.eth_addresses || [],
      activeStatus: rawUser.active_status || 'inactive',
    };
  }

  /**
   * Transform raw API cast data
   */
  private transformCast(rawCast: any): FarcasterCast {
    return {
      hash: rawCast.hash,
      parentHash: rawCast.parent_hash,
      parentUrl: rawCast.parent_url,
      rootParentUrl: rawCast.root_parent_url,
      threadHash: rawCast.thread_hash || rawCast.hash,
      author: this.transformUser(rawCast.author),
      text: rawCast.text || '',
      timestamp: rawCast.timestamp,
      embeds: rawCast.embeds || [],
      reactions: {
        likesCount: rawCast.reactions?.likes_count || 0,
        recastsCount: rawCast.reactions?.recasts_count || 0,
        likes: rawCast.reactions?.likes || [],
        recasts: rawCast.reactions?.recasts || [],
      },
      replies: {
        count: rawCast.replies?.count || 0,
      },
      channel: rawCast.channel,
    };
  }

  /**
   * Get user by verified wallet address (reverse lookup)
   */
  async getUserByVerifiedAddress(address: string): Promise<FarcasterUser | null> {
    try {
      const response = await this.request<{ users: any[] }>(`/user/by-verification?address=${address}`);
      
      if (!response.users || response.users.length === 0) {
        return null;
      }

      // Return the first user found with this verified address
      return this.transformUser(response.users[0]);
    } catch (error) {
      console.error(`Failed to get user by address ${address}:`, error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const user = await this.getUserByFid(3); // Farcaster founder
      return user !== null;
    } catch (error) {
      console.error('Farcaster health check failed:', error);
      return false;
    }
  }
}

// Export the same interface as before
export function getFarcasterClient() {
  const apiKey = import.meta.env.VITE_NEYNAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_NEYNAR_API_KEY environment variable is required');
  }

  return new NeynarAPIClient(apiKey);
}

export default NeynarAPIClient;