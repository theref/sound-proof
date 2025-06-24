# Sound Proof - Agent Guidelines

## Commands
- Dev server: `npm run dev`
- Build: `npm run build` (production) or `npm run build:dev` (development)
- Lint: `npm run lint`
- Preview: `npm run preview`

## Architecture
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: NuCypher TACO for decryption, Ethereum for wallet integration
- **File Storage**: Lighthouse for encrypted audio files
- **Key Directories**: 
  - `src/components/` - UI components including PlayerBar, TrackCard, UploadTrack
  - `src/contexts/` - React contexts (PlaybackContext for audio playback)
  - `src/pages/` - Route components (Index, Song, Profile, NotFound)
  - `src/integrations/supabase/` - Database client and types

## Code Style
- **Imports**: Use `@/` path alias for src directory imports
- **Components**: Functional components with TypeScript interfaces
- **Styling**: Tailwind CSS with `cn()` utility from `@/lib/utils`
- **State**: React Context for global state, React Query for server state
- **Error Handling**: Toast notifications via Sonner
- **TypeScript**: Loose config (noImplicitAny: false, strictNullChecks: false)
- **File Structure**: One component per file, co-locate types with components when small
