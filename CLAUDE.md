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

- Dev server: `npm run dev` (starts Vite dev server on port 8080)
- Build: `npm run build` (production) or `npm run build:dev` (development)
- Lint: `npm run lint` (ESLint with TypeScript support)
- Preview: `npm run preview` (preview production build)

## Architecture

**Sound Proof** is a decentralized music platform using blockchain and encryption for access control.

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL) with edge functions
- **Encryption**: NuCypher TACo for threshold access control and file encryption
- **Blockchain**: Ethereum (wallet connection) + Polygon Amoy testnet (for TACo operations)
- **File Storage**: Lighthouse (IPFS) for encrypted/unencrypted audio files
- **State Management**: React Context + TanStack React Query

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

#### Database Schema
- **tracks table**: `id`, `title`, `uploader`, `cid` (Lighthouse hash), `access_rule` (JSON), `created_at`
- **users table**: `id` (wallet address), `display_name`, `created_at`
- Foreign key relationship: `tracks.uploader` → `users.id`

### Key Directories
- `src/components/` - UI components (PlayerBar, TrackCard, UploadTrack, WalletConnection)
- `src/contexts/` - React contexts (PlaybackContext for audio playback state)
- `src/pages/` - Route components (Index, Song, Profile, NotFound)
- `src/integrations/supabase/` - Database client, types, and utilities
- `src/services/` - External service integrations (Lighthouse IPFS)
- `src/utils/` - Utility functions (encryption with TACo)
- `src/types/` - TypeScript type definitions (TACo conditions, access rules)
- `supabase/functions/` - Edge functions for server-side operations

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

### File Upload Flow
1. Audio file uploaded to Lighthouse via Supabase edge function (`supabase/functions/lighthouse-upload/`)
2. Returns IPFS hash (CID) for storage in database
3. For encrypted files: encrypt with TACo before upload, store serialized MessageKit
4. For playback: fetch file, decrypt if needed, create blob URL, play

### Network Requirements
- Ethereum mainnet/testnet for wallet connection and user authentication
- Polygon Amoy testnet for TACo encryption/decryption operations
- IPFS via Lighthouse gateway for file retrieval