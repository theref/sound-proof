# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Vision

**SoundProof** is a music-discovery platform where listeners **pay-once** (≈3¢) to **own a track forever** and **discover tomorrow's artists today**. The platform pays 90% of every sale directly to emerging artists.

### Core User Personas
- **Listener** ("Crate-Digger"): Finds fresh underground music, keeps it forever
- **Creator** ("Bedroom Producer"): Uploads quickly, earns real money, watches fandom grow  
- **Curator** ("Playlist DJ"): Builds reputation and income by sharing killer playlists

### Key Product Principles
- **Economics**: 90% artist, 10% treasury (for storage + ops)
- **Pricing**: TrackPass starts at 3¢; bonding-curve with 99¢ cap
- **UX**: "Feels like magic discovery" with transparent, immediate income for creators
- **No wallet friction**: Hidden purchases, instant ownership
- **Social**: Leverage Farcaster FIDs for social graph, immutable playlist casts

### Must-Have User Flows (Priority Order)
1. **Lean-back feed** (30-sec hooks → full track)
2. **One-click upload** (encrypt → publish)
3. **Instant ownership** (hidden purchase, no wallet friction)
4. **Immutable playlist publish** (via Farcaster cast)
5. **Creator dashboard** (real-time sales + follower growth)
6. **Feed filters** ("Humans only", "Hide tracks I already own")

### Success Metrics (90-Day Target)
- Monthly Active Listeners: 10k
- Monthly Active Creators: 1k  
- Avg. listener spend: $2-$5/mo
- Avg. creator income: ≥$20/mo
- Median session length: 20 min

### Launch Readiness Criteria
- ≥3k tracks in catalog
- Avg. listener session ≥15 min
- Artists paid ≥$500 total

### Launch-Phase Feature Checklist
- [ ] Creative-Commons seed import (≥2k tracks)
- [ ] Friends-and-DM private uploader (target +300 tracks)
- [ ] Public beta wait-list & open upload (target cumulative 3k–4k tracks)
- [ ] Daily "Discovery Mix" (fresh tracks < 1k plays)
- [ ] First-500-sales artist spotlight push
- [ ] Farcaster Frame player with buy button
- [ ] Basic creator payout reporting (.csv download)

### Current Implementation Status
**✅ Built:** Basic track upload, TACo encryption, audio playback, wallet connection
**🚧 In Progress:** Access control system, track ownership, basic UI components
**❌ Missing:** Payment system, bonding curve pricing, Farcaster integration, creator payouts, discovery algorithms, social features

### Critical Next Steps
1. **Payment & Ownership System**: Implement TrackPass purchasing with bonding curve pricing
2. **Farcaster Integration**: Social graph, playlist casts, user authentication
3. **Creator Economics**: Payout system, revenue splitting, dashboard
4. **Discovery Engine**: Feed algorithm, filtering, recommendation system
5. **User Onboarding**: Wallet abstraction, seamless purchase flow

## Commands

- **Frontend**: `npm run dev` (starts Vite dev server on port 8080)
- **Convex**: `npx convex dev` (starts Convex development server with hot reloading)  
- **Build**: `npm run build` (production) or `npm run build:dev` (development)
- **Deploy**: `npx convex deploy` (deploys Convex functions to production)
- **Lint**: `npm run lint` (ESLint with TypeScript support)
- **Preview**: `npm run preview` (preview production build)

## Architecture

**Sound Proof** is a decentralized music platform using blockchain and encryption for access control, with Convex as the reactive state brain.

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **State Brain**: Convex (metadata, quotas, reactive dashboards, webhooks)
- **Encryption**: NuCypher TACo for threshold access control and file encryption
- **Blockchain**: Ethereum (payments, ownership) + Polygon Amoy testnet (for TACo operations)
- **File Storage**: Lighthouse (IPFS) for encrypted/unencrypted audio files
- **State Management**: Convex + React Context + TanStack React Query

### Key Architecture Patterns

#### Access Control System
- **TACo Integration**: Uses NuCypher's threshold access control for encrypting/decrypting audio files
- **Access Rules**: Defined in `src/types/access-rules.ts` - supports public, ERC20 token, and NFT-based access
- **Encryption Flow**: `src/utils/encryption.ts` handles TACo encryption, `src/contexts/PlaybackContext.tsx` handles decryption
- **Network Switching**: Automatically switches to Polygon Amoy testnet for TACo operations

#### Audio Playback System
- **PlaybackContext**: Central state management for audio playback in `src/contexts/PlaybackContext.tsx`
- **Decryption Pipeline**: Fetches encrypted files → checks access conditions → decrypts with TACo → creates blob URL → plays audio
- **Dual Mode**: Handles both encrypted and unencrypted audio files seamlessly

#### Convex State Management
- **Convex Role**: State brain for metadata, quotas, reactive dashboards, and webhook ingestion
- **Not in Convex**: Audio files, encryption keys, large analytics, money/payments
- **Schema**: Users (FID + quotas), tracks (metadata + CIDs), purchases (mirrored from chain), analytics (materialized views)
- **Real-time**: Automatic UI updates via Convex subscriptions without custom WebSockets

### Key Directories
- `src/components/` - UI components (PlayerBar, TrackCard, UploadTrack, WalletConnection)
- `src/contexts/` - React contexts (PlaybackContext for audio playback state)
- `src/pages/` - Route components (Index, Song, Profile, NotFound)
- `src/hooks/` - Custom React hooks (useConvex data fetching, useFarcasterAuth)
- `src/services/` - External service integrations (Lighthouse IPFS)
- `src/utils/` - Utility functions (encryption with TACo)
- `src/types/` - TypeScript type definitions (TACo conditions, access rules)
- `convex/` - Convex functions (queries, mutations, actions, schema, HTTP endpoints)

## Convex Guidelines for SoundProof

### Purpose of Convex
Convex serves as the **state brain** for SoundProof, handling:
- **Small metadata**: Track info, user quotas, cached Farcaster profiles
- **Reactive dashboards**: Creator earnings, play stats, follower counts (without custom WebSockets)
- **Webhook ingestion**: Mirror on-chain purchase events for instant UI updates
- **Task scheduling**: Daily rollups, cache cleanup, fraud checks

**NEVER store in Convex**: Money, audio files, encryption keys, PII (emails/IPs), or large analytics

### Architecture Principles

#### Single Source of Truth
- **Money & ownership**: Smart contracts on blockchain
- **Files**: IPFS/Lighthouse for audio storage
- **Secrets**: Client-side only (TACo decryption keys)
- **Convex**: Coordinates app state and provides reactive UI

#### External I/O Separation
```typescript
// ✅ GOOD: Separate external calls from database writes
const webhookHandler = httpAction(async (ctx, request) => {
  // 1. External verification first
  const txData = await verifyBlockchainTransaction(body.txHash);
  
  // 2. Then single atomic database write  
  await ctx.runMutation(internal.purchases.recordPurchase, txData);
});

// ❌ BAD: Mixing external calls with multiple DB operations
const badHandler = mutation(async (ctx, args) => {
  await callExternalAPI(); // Don't mix I/O with mutations
  await ctx.db.insert("table1", data1);
  await ctx.db.update("table2", data2); // Multiple writes in one function
});
```

#### Idempotency Everywhere
All writes that may be retried (webhooks, uploads) must be safe to repeat:
```typescript
export const processPurchase = mutation({
  handler: async (ctx, args) => {
    // Use transaction hash as idempotency key
    const existing = await ctx.db.query("purchases")
      .withIndex("by_tx", q => q.eq("txHash", args.txHash))
      .first();
    
    if (existing) return existing; // Already processed
    
    // Safe to insert
    return await ctx.db.insert("purchases", args);
  }
});
```

#### Materialized Views for Performance
Pre-compute data the UI reads frequently:
```typescript
// Update summary stats when recording individual events
const recordPlay = mutation({
  handler: async (ctx, args) => {
    // Record individual play event
    await ctx.db.insert("playEvents", args);
    
    // Update materialized track stats immediately
    const track = await ctx.db.get(args.trackId);
    await ctx.db.patch(args.trackId, {
      "stats.playCount": track.stats.playCount + 1,
      "stats.lastPlay": Date.now()
    });
  }
});

// Dashboard reads pre-computed data (fast)
export const getTrackStats = query({
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trackId); // Already materialized
  }
});
```

### Data Patterns

#### User Quotas & Rate Limiting
```typescript
users: {
  fid: number,                    // Only identifier (no PII)
  uploadQuota: {
    totalTracks: number,
    usedStorage: number,
    maxTracks: number,
    resetDate: number
  },
  rateLimits: {
    uploadsToday: number,
    lastUpload: number,
    maxUploadsPerDay: number
  }
}

// Quota checking with clear error messages
export const checkUploadQuota = mutation({
  handler: async (ctx, args) => {
    const user = await getUserByFid(ctx, args.fid);
    
    if (user.uploadQuota.totalTracks >= user.uploadQuota.maxTracks) {
      throw new Error(`Upload limit reached (${user.uploadQuota.maxTracks} tracks). Upgrade for more.`);
    }
    
    return { allowed: true, remaining: user.uploadQuota.maxTracks - user.uploadQuota.totalTracks };
  }
});
```

#### Webhook Ingestion (On-chain → Convex)
```typescript
// HTTP endpoint for trusted webhooks
export const purchaseWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();
  
  // Rate limiting per webhook sender
  await checkWebhookRateLimit(body.senderId);
  
  // External verification (separate from DB writes)
  const txData = await verifyOnChainTransaction(body.txHash);
  
  // Idempotent database mirror
  await ctx.runMutation(internal.purchases.mirror, {
    txHash: body.txHash,        // Idempotency key
    ...txData
  });
  
  return new Response("OK");
});
```

#### Caching with TTL
```typescript
// Farcaster profile cache with automatic expiry
farcasterProfiles: {
  fid: number,
  username: string,
  displayName: string,
  cachedAt: number,
  expiresAt: number           // 1 hour TTL
}

export const getProfile = query({
  handler: async (ctx, args) => {
    const cached = await ctx.db.query("farcasterProfiles")
      .withIndex("by_fid", q => q.eq("fid", args.fid))
      .first();
    
    // Return cached if fresh
    if (cached && cached.expiresAt > Date.now()) {
      return cached;
    }
    
    // Schedule background refresh for stale data
    if (cached) {
      ctx.scheduler.runAfter(0, internal.farcaster.refreshProfile, args);
    }
    
    return cached; // Return stale while refreshing
  }
});
```

### React Integration

#### Custom Hooks for Convex
```typescript
// src/hooks/useConvexTracks.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useUserTracks = (fid: number) => {
  return useQuery(api.tracks.getByUploader, { fid });
};

export const useCreateTrack = () => {
  const createTrack = useMutation(api.tracks.create);
  
  return async (trackData: TrackInput) => {
    // Check quota first
    const quota = await checkUploadQuota({ fid: trackData.uploaderFid });
    if (!quota.allowed) throw new Error("Upload quota exceeded");
    
    return await createTrack(trackData);
  };
};

// Component with reactive updates
const CreatorDashboard = ({ fid }: { fid: number }) => {
  const tracks = useUserTracks(fid);
  const stats = useQuery(api.creators.getStats, { fid });
  
  // Automatically updates when new sales happen
  if (!tracks || !stats) return <LoadingSpinner />;
  
  return (
    <div>
      <h2>Total Earnings: {formatWei(stats.totalEarningsWei)} ETH</h2>
      <p>Tracks: {tracks.length}</p>
    </div>
  );
};
```

### Commands
- **Dev**: `npx convex dev` (starts Convex development server)
- **Deploy**: `npx convex deploy` (deploys functions to production)
- **Dashboard**: Access Convex dashboard for data inspection and logs

### What NOT to Do
- ❌ Don't store audio files or large assets in Convex
- ❌ Don't store encryption keys or secrets
- ❌ Don't implement heavy recommendation algorithms in Convex  
- ❌ Don't rely on client-submitted financial data
- ❌ Don't create second-by-second writes for presence features
- ❌ Don't store PII (emails, IP addresses, device IDs)

## Important Implementation Details

### TACo (Threshold Access Control)
- Uses DEVNET domain for development
- Requires Polygon Amoy testnet (chain ID 80002)
- Encryption/decryption requires wallet connection and network switching
- Access conditions support ERC20 token balance and ERC721 NFT ownership checks

### TypeScript Configuration
- Loose configuration: `noImplicitAny: false`, `strictNullChecks: false`
- Path alias: `@/*` maps to `./src/*`
- ESLint configured with React hooks and TypeScript support

### Styling and Components
- Tailwind CSS with `cn()` utility from `@/lib/utils` for class merging
- shadcn/ui component library for consistent UI primitives
- Toast notifications via Sonner for user feedback

### File Upload Flow (Convex-Integrated)
1. **Quota Check**: Convex validates user upload quota and rate limits
2. **File Upload**: Audio file uploaded to Lighthouse/IPFS (external to Convex)
3. **Encryption**: For private tracks, encrypt with TACo client-side before upload
4. **Metadata Storage**: Store track metadata and IPFS CID in Convex (not the audio file)
5. **Reactive Updates**: UI automatically updates via Convex subscriptions
6. **Playback**: Fetch file from IPFS, decrypt with TACo if needed, play via Web Audio API

### Network Requirements
- Ethereum mainnet/testnet for wallet connection and user authentication
- Polygon Amoy testnet for TACo encryption/decryption operations
- IPFS via Lighthouse gateway for file retrieval