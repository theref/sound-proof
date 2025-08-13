# SoundProof Development Workflow 🛠️

Complete guide for developing, testing, and maintaining SoundProof. Perfect for onboarding new developers and ensuring consistent development practices.

## 🚀 Quick Start for Developers

### 1. First Time Setup

```bash
# Clone repository
git clone <repository-url>
cd sound-proof

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# VITE_NEYNAR_API_KEY=your_neynar_api_key
# VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
```

### 2. Get API Keys

| Service | URL | Purpose | Free Tier |
|---------|-----|---------|-----------|
| Neynar | https://neynar.com/ | Farcaster API | 1000 req/day |
| Lighthouse | https://lighthouse.storage/ | IPFS storage | 100MB free |

### 3. Development Server

```bash
# Start development server
npm run dev

# Open http://localhost:8080
# App should load with Farcaster sign-in screen
```

### 4. Verify Setup

```bash
# Open browser console and run:
console.log('Neynar key:', import.meta.env.VITE_NEYNAR_API_KEY?.slice(0,8));
console.log('Lighthouse key:', import.meta.env.VITE_LIGHTHOUSE_API_KEY?.slice(0,8));

# Both should show truncated keys
```

## 🧪 Built-in Testing System

### Access Testing Suite

Add this to your `Index.tsx` temporarily:

```tsx
// In src/pages/Index.tsx, add import
import { TestingSuite } from "@/components/TestingSuite";

// Add a test route (temporary)
{activeView === "test" && <TestingSuite />}

// Then visit: http://localhost:8080 and change activeView to "test" in browser console:
// window.location.hash = "#test"
```

### Testing Suite Features

- **Environment Tests**: Verify API keys are loaded
- **Storage Tests**: Check localStorage functionality  
- **API Tests**: Test Farcaster and IPFS connections
- **Auth Tests**: Verify authentication flow
- **Export Debug Data**: Download system state for debugging

### Manual Testing Checklist

```markdown
## Pre-Development Testing
- [ ] Environment variables loaded correctly
- [ ] Dev server starts without errors
- [ ] Browser console shows no critical errors
- [ ] API keys validate successfully

## Feature Testing
- [ ] Farcaster sign-in flow works end-to-end
- [ ] Track upload completes successfully  
- [ ] Audio playback works for public tracks
- [ ] Audio playback works for encrypted tracks
- [ ] Data persists across browser refresh
- [ ] Social sharing links work correctly

## Cross-Browser Testing
- [ ] Chrome/Chromium based browsers
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile browsers (responsive design)
```

## 📁 Project Structure Deep Dive

### Core Directories

```
src/
├── components/           # React UI components
│   ├── ui/              # shadcn/ui base components
│   ├── *Simple.tsx      # MVP simplified components
│   ├── TestingSuite.tsx # Development testing component
│   └── FarcasterTest.tsx # API testing component
│
├── hooks/               # Custom React hooks
│   ├── useFarcasterAuth.ts  # Authentication logic
│   ├── useAudioPlayer.ts    # Audio playback controls
│   └── use-toast.ts         # Toast notifications
│
├── contexts/            # React Context providers
│   └── PlaybackContext.tsx # Global audio state
│
├── services/            # External service integrations
│   ├── lighthouseService.ts # IPFS file operations
│   └── ipfsMetadata.ts      # Metadata management
│
├── integrations/        # Third-party SDK wrappers
│   └── farcaster/       # Farcaster/Neynar integration
│       ├── client.ts    # API client with rate limiting
│       ├── types.ts     # TypeScript definitions
│       ├── utils.ts     # Helper functions
│       └── index.ts     # Public exports
│
├── utils/               # Utility functions
│   ├── localStorage.ts  # Storage management
│   └── encryption.ts    # TACo encryption helpers
│
└── types/               # Global TypeScript types
    └── access-rules.ts  # Access control definitions
```

### Component Naming Convention

- **`*Simple.tsx`**: MVP simplified components (no database)
- **`*.tsx`**: Original components (may have database dependencies)
- **`*Test.tsx`**: Development testing components

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # Production build
npm run build:dev       # Development build
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix auto-fixable ESLint issues

# Testing
npm run test            # Run unit tests (if configured)
npm run test:ui         # Run tests with UI
npm run test:run        # Run tests once
```

## 🐛 Debugging Guide

### Common Development Issues

#### ❌ "Cannot connect to development server"

```bash
# Check if port is in use
lsof -ti:8080

# Kill process if needed
kill -9 $(lsof -ti:8080)

# Try different port
npm run dev -- --port 3000
```

#### ❌ "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for missing dependencies
npm ls
```

#### ❌ "Environment variables not loading"

```bash
# Verify .env file exists and has no BOM
file .env

# Check environment in browser console
console.log(import.meta.env);

# Restart dev server after .env changes
```

#### ❌ "Farcaster API errors"

```javascript
// Test API key in browser console
fetch('https://api.neynar.com/v2/farcaster/user/bulk?fids=3', {
  headers: { 'api_key': 'YOUR_API_KEY_HERE' }
}).then(r => r.json()).then(console.log);
```

#### ❌ "IPFS upload failures"

```javascript
// Test Lighthouse API key
fetch('https://node.lighthouse.storage/api/v0/status', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY_HERE' }
}).then(r => r.json()).then(console.log);
```

### Debugging Tools

```typescript
// localStorage inspection
import { storage } from '@/utils/localStorage';
console.log('Storage info:', storage.getStorageInfo());
console.log('All data:', storage.exportData());

// Farcaster client debugging
import { getFarcasterClient } from '@/integrations/farcaster/client';
const client = getFarcasterClient();
console.log('Rate limits:', client.getRateLimitStatus());

// Audio playback debugging
// Check PlaybackContext state in React DevTools
```

## 🔄 Git Workflow

### Branch Strategy

```bash
# Main branches
main                    # Production ready code
develop                 # Integration branch

# Feature branches
feature/auth-improvements
feature/upload-optimization
bugfix/player-controls
hotfix/critical-security-issue
```

### Commit Convention

```bash
# Format: <type>(<scope>): <description>
git commit -m "feat(auth): add Farcaster SIWF integration"
git commit -m "fix(player): resolve audio loading issues"  
git commit -m "docs(readme): update setup instructions"
git commit -m "test(upload): add IPFS upload test suite"

# Types: feat, fix, docs, style, refactor, test, chore
```

### Pre-commit Checklist

```markdown
## Before Committing
- [ ] Code lints without errors (`npm run lint`)
- [ ] All tests pass (manual testing minimum)
- [ ] No console.error() in production code
- [ ] Environment variables documented in .env.example
- [ ] TypeScript compiles without errors
- [ ] Components have proper error boundaries
```

## 📦 Build & Deployment

### Local Testing of Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Build will be in dist/ directory
```

### Environment-Specific Builds

```bash
# Development build (with debug info)
npm run build:dev

# Production build (optimized)
npm run build
```

### Deployment Checklist

```markdown
## Pre-Deployment
- [ ] Production environment variables configured
- [ ] API keys have sufficient quotas/permissions
- [ ] Build completes without errors
- [ ] All tests pass in production environment
- [ ] Error boundaries handle edge cases
- [ ] Performance optimizations applied

## Post-Deployment
- [ ] App loads correctly
- [ ] Sign-in flow works
- [ ] Upload functionality works  
- [ ] Audio playback works
- [ ] No critical console errors
```

## 🔐 Security Considerations

### Development Security

```bash
# Never commit sensitive data
git-secrets --install    # Prevent accidental commits of keys
echo "*.env" >> .gitignore

# API keys in development
# Use development/test API keys, not production
# Rotate keys regularly
# Monitor API usage for anomalies
```

### Code Security

```typescript
// Input validation
- Validate all user inputs (filenames, usernames)
- Sanitize data before storage
- Use TypeScript for type safety

// API Security  
- Rate limiting built into clients
- Error handling doesn't leak sensitive info
- No sensitive data in localStorage
```

## 📊 Performance Monitoring

### Development Performance

```javascript
// Monitor bundle size
npm run build -- --analyze

// Check lighthouse metrics
// Use browser dev tools Lighthouse tab

// Monitor localStorage usage
const usage = JSON.stringify(localStorage).length;
console.log('localStorage usage:', usage, 'bytes');
```

### Runtime Performance

```typescript
// Track slow operations
console.time('track-upload');
await uploadTrack();
console.timeEnd('track-upload');

// Monitor memory usage
console.log('Memory:', performance.memory);

// Track API response times
const start = Date.now();
await farcasterClient.getUserByUsername(username);
console.log('API response time:', Date.now() - start, 'ms');
```

## 🚀 Advanced Development

### Adding New Components

```bash
# Create component with proper structure
mkdir src/components/NewFeature
touch src/components/NewFeature/index.tsx
touch src/components/NewFeature/NewFeature.tsx
touch src/components/NewFeature/types.ts

# Export from main components/index.ts
export { NewFeature } from './NewFeature';
```

### Adding New API Integrations

```bash
# Create service module
touch src/services/newService.ts

# Add types
touch src/types/newService.ts

# Add environment variables
echo "VITE_NEW_SERVICE_API_KEY=your_key" >> .env.example

# Add tests
touch src/components/NewServiceTest.tsx
```

### Extending Storage System

```typescript
// Add new storage category
// In src/utils/localStorage.ts

const STORAGE_KEYS = {
  // ... existing keys
  NEW_FEATURE: 'soundproof_new_feature',
} as const;

export const newFeatureStorage = {
  save: (data: NewFeatureData): void => {
    localStorage.setItem(STORAGE_KEYS.NEW_FEATURE, JSON.stringify(data));
  },
  get: (): NewFeatureData | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.NEW_FEATURE);
    return stored ? JSON.parse(stored) : null;
  },
};
```

## 🎉 Contributing Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions  
- Add JSDoc comments for public functions
- Use consistent error handling patterns
- Prefer functional components with hooks

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

---

**🎵 Happy Developing!** This guide should help you build amazing features for SoundProof efficiently and safely.