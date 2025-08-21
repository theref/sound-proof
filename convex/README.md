# Convex Implementation for SoundProof

This directory contains the Convex backend implementation for SoundProof's state brain.

## 🎯 Purpose

Convex serves as SoundProof's **state brain** for:
- **Track metadata storage** (NOT audio files - those stay on IPFS)
- **User session management** (FID-based, not PII)
- **Real-time feed updates** (reactive UI without WebSockets)
- **Future: Purchase events mirroring** (from blockchain)

## 📁 File Structure

```
convex/
├── schema.ts           # Database schema with migration support
├── users.ts           # User CRUD operations  
├── tracks.ts          # Track metadata operations
├── migrations.ts      # Schema migration utilities
└── _generated/        # Auto-generated types (do not edit)
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install convex
```

### 2. Deploy to Convex Cloud
```bash
npx convex dev
```
Follow the prompts to create a Convex project and get your deployment URL.

### 3. Configure Environment
Add to `.env.local`:
```bash
VITE_CONVEX_URL=https://your-deployment-url.convex.cloud
```

### 4. Restart Dev Server
```bash
npm run dev
```

## 📊 Schema Overview

### Users Table
```typescript
users: {
  fid: number,                    // Farcaster FID (primary identifier)
  walletAddress?: string,         // Connected wallet
  schemaVersion?: number,         // For migrations
  createdAt: number,
  lastActive: number,
  updatedAt: number
}
```

### Tracks Table  
```typescript
tracks: {
  title: string,
  artist: string,
  uploaderFid: number,           // Maps to Farcaster FID
  uploaderUsername: string,
  cid: string,                   // IPFS hash (NOT the audio file)
  metadataCid?: string,
  coverImageCid?: string,
  accessRule: {                  // Access control rules
    type: 'public' | 'erc20' | 'erc721',
    contractAddress?: string,
    minBalance?: string
  },
  duration?: number,
  genre?: string,
  description?: string,
  isEncrypted: boolean,
  playCount: number,             // Materialized counter
  schemaVersion?: number,
  uploadedAt: number,
  updatedAt: number
}
```

## 🔄 Migration Support

The implementation includes proper migration handling for future schema changes:

- **Schema versioning** via `_schema_version` table
- **Per-record versioning** via `schemaVersion` fields  
- **Idempotent migrations** safe to replay
- **localStorage migration utility** for existing data

### Migrate localStorage Data
```typescript
// Import existing localStorage tracks
import { migrateLocalStorageToConvex } from "@/lib/convex";

await migrateLocalStorageToConvex();
```

## 🎣 React Hooks

### Track Hooks
```typescript
import { useUserTracks, useRecentTracks, useCreateTrack } from "@/hooks/useConvexTracks";

// Get user's tracks (replaces localStorage getUserTracks)
const userTracks = useUserTracks(userFid);

// Get recent tracks for feed (replaces localStorage getFeedTracks)  
const feedTracks = useRecentTracks(excludeUserFid);

// Create new track
const createTrack = useCreateTrack();
```

### User Hooks
```typescript
import { useUserByFid, useEnsureUser } from "@/hooks/useConvexUsers";

// Get user by FID
const user = useUserByFid(fid);

// Ensure user exists (creates if not)
const { ensureUserExists } = useEnsureUser(fid, walletAddress);
```

## 🚀 What's Next

Phase 2 will add:
- **Purchase event mirroring** from blockchain
- **Creator analytics dashboard** 
- **Farcaster profile caching**
- **Real-time notifications**

But for now, this provides the foundation for multi-user track storage and real-time feeds!

## 🔍 Debugging

Visit `http://localhost:8080?debug=true` to see the ConvexTest component which shows:
- Connection status
- Query results  
- Configuration details
- Migration tools

## Guidelines Compliance ✅

This implementation follows all Convex guidelines:
- ✅ **External I/O separation** (file uploads separate from metadata storage)
- ✅ **Idempotent operations** (safe to replay)
- ✅ **Materialized views** (play counts pre-computed)
- ✅ **No PII storage** (only FIDs and wallet addresses)
- ✅ **Future-proof migrations** (schema versioning)