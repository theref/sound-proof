/**
 * Direct Farcaster Hub API client (free alternative to Neynar)
 * Uses the public Farcaster protocol Hub for reverse address lookups
 */

import type { FarcasterUser } from './types';

const FARCASTER_HUB_URL = 'https://hub.farcaster.standardcrypto.vc:2281';

class FarcasterHubClient {
  
  /**
   * Get user by verified wallet address using Hub API
   */
  async getUserByVerifiedAddress(address: string): Promise<FarcasterUser | null> {
    try {
      console.log('🔍 Querying Farcaster Hub for address:', address);
      
      // Query the Hub for verifications by address
      const response = await fetch(
        `${FARCASTER_HUB_URL}/v1/verificationsByFid?address=${address}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Hub API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.messages || data.messages.length === 0) {
        console.log('❌ No verifications found for address:', address);
        return null;
      }

      // Extract FID from the first verification
      const fid = data.messages[0].data.fid;
      console.log('✅ Found FID for address:', fid);

      // Now get user data by FID using the Hub
      return await this.getUserByFid(fid);
      
    } catch (error) {
      console.error('Hub API error:', error);
      return null;
    }
  }

  /**
   * Get user profile by FID using Hub API
   */
  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    try {
      // Get user data from Hub
      const response = await fetch(
        `${FARCASTER_HUB_URL}/v1/userDataByFid?fid=${fid}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Hub API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.messages || data.messages.length === 0) {
        return null;
      }

      // Parse user data from Hub messages
      const userData: any = {};
      
      for (const message of data.messages) {
        const userDataType = message.data.userDataBody.type;
        const value = message.data.userDataBody.value;
        
        switch (userDataType) {
          case 'USER_DATA_TYPE_USERNAME':
            userData.username = value;
            break;
          case 'USER_DATA_TYPE_DISPLAY':
            userData.displayName = value;
            break;
          case 'USER_DATA_TYPE_PFP':
            userData.pfp = { url: value };
            break;
          case 'USER_DATA_TYPE_BIO':
            userData.bio = value;
            break;
        }
      }

      // Get verifications
      const verificationsResponse = await fetch(
        `${FARCASTER_HUB_URL}/v1/verificationsByFid?fid=${fid}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
        }
      );

      let verifications: string[] = [];
      if (verificationsResponse.ok) {
        const verificationData = await verificationsResponse.json();
        verifications = verificationData.messages?.map((msg: any) => 
          msg.data.verificationAddBody.address
        ) || [];
      }

      return {
        fid,
        username: userData.username || '',
        displayName: userData.displayName || userData.username || '',
        pfp: userData.pfp || { url: '' },
        profile: {
          bio: { text: userData.bio || '' }
        },
        followerCount: 0, // Hub doesn't provide these stats
        followingCount: 0,
        verifications,
        activeStatus: 'active' as const
      };

    } catch (error) {
      console.error('Hub user lookup error:', error);
      return null;
    }
  }
}

export default FarcasterHubClient;