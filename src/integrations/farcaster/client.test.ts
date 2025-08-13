/**
 * Basic integration tests for Farcaster client
 * These tests verify the SDK setup and basic functionality
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import FarcasterClient, { getFarcasterClient, initializeFarcasterClient } from './client';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_NEYNAR_API_KEY: 'test-api-key',
  },
}));

describe('FarcasterClient', () => {
  let client: FarcasterClient;

  beforeAll(() => {
    // Initialize with test API key
    client = initializeFarcasterClient('test-api-key', {
      maxRequests: 10,
      windowMs: 60000,
    });
  });

  describe('Initialization', () => {
    it('should create client with API key', () => {
      expect(client).toBeInstanceOf(FarcasterClient);
    });

    it('should throw error without API key', () => {
      expect(() => {
        new FarcasterClient('');
      }).toThrow('Farcaster API key is required');
    });

    it('should get singleton instance', () => {
      const instance1 = getFarcasterClient();
      const instance2 = getFarcasterClient();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Rate Limiting', () => {
    it('should track rate limit status', () => {
      const rateLimitStatus = client.getRateLimitStatus();
      expect(rateLimitStatus).toBeInstanceOf(Map);
    });
  });

  describe('User Operations', () => {
    it('should handle getUserByFid with invalid FID gracefully', async () => {
      // This will likely fail with test API key, but should not throw
      const user = await client.getUserByFid(-1);
      expect(user).toBeNull();
    });

    it('should handle getUserByUsername with invalid username gracefully', async () => {
      // This will likely fail with test API key, but should not throw
      const user = await client.getUserByUsername('nonexistent-user-12345');
      expect(user).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should perform health check', async () => {
      // With test API key, this should fail gracefully
      const isHealthy = await client.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});

describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    const client = new FarcasterClient('invalid-key');
    
    // These should not throw but return null/false
    const user = await client.getUserByFid(1);
    expect(user).toBeNull();
    
    const isHealthy = await client.healthCheck();
    expect(isHealthy).toBe(false);
  });
});

// Integration test that requires real API key (skipped by default)
describe.skip('Real API Integration', () => {
  let realClient: FarcasterClient;

  beforeAll(() => {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY required for integration tests');
    }
    realClient = new FarcasterClient(apiKey);
  });

  it('should fetch real user data', async () => {
    // Test with Dan Romero (Farcaster founder, FID 3)
    const user = await realClient.getUserByFid(3);
    
    expect(user).not.toBeNull();
    expect(user?.fid).toBe(3);
    expect(user?.username).toBeTruthy();
    expect(user?.displayName).toBeTruthy();
  });

  it('should perform successful health check', async () => {
    const isHealthy = await realClient.healthCheck();
    expect(isHealthy).toBe(true);
  });
});