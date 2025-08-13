# SoundProof MVP 🎵

A Farcaster-native music discovery platform where listeners pay once (≈3¢) to own tracks forever and discover tomorrow's artists today.

## ✨ Features

- **Farcaster-Only Authentication**: Sign in with your Farcaster identity
- **Social Music Discovery**: Discover tracks through your Farcaster network
- **Local Storage**: Simple MVP storage without database complexity  
- **IPFS Storage**: Permanent, decentralized file storage via Lighthouse
- **TACo Encryption**: Optional track encryption with threshold access control
- **Rich Profiles**: Leverage Farcaster social data and verified addresses

## 🚀 Quick Start

### Prerequisites

1. **Lighthouse API Key** - Get from [lighthouse.storage](https://lighthouse.storage/)
2. **Neynar API Key** - Get from [neynar.com](https://neynar.com/) for Farcaster integration
3. **Farcaster Account** - Create at [warpcast.com](https://warpcast.com/)

### Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd sound-proof
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys:
   # VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
   # VITE_NEYNAR_API_KEY=your_neynar_api_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Visit** http://localhost:8080

5. **Enable Testing** (optional): Visit http://localhost:8080?debug=true for built-in test tools

## 🧪 Testing Farcaster Integration

To verify your Farcaster setup is working:

1. **Check API Key**: Ensure `VITE_NEYNAR_API_KEY` is set correctly
2. **Test User Lookup**: Try signing in with a known Farcaster username
3. **Verify Wallet Connection**: Ensure the wallet you're connecting has a verified address on your Farcaster profile
4. **Check Browser Console**: Look for any API errors during authentication

### Common Issues

- **"Farcaster user not found"**: Double-check the username spelling (no @ symbol)
- **"Wallet not verified"**: Go to warpcast.com/~/settings/verified-addresses and add your wallet
- **"API key not found"**: Ensure environment variables are properly loaded (restart dev server)
- **Network errors**: Check your Neynar API key permissions and rate limits

## 📚 Documentation

- **[TESTING-QUICK.md](./TESTING-QUICK.md)** - Quick testing setup (start here!)  
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow and debugging
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and components

## 🧪 Built-in Testing Tools

SoundProof includes comprehensive testing tools for local development:

### Quick Test Access
```bash
# Start with debug tools enabled
npm run dev
# Visit: http://localhost:8080?debug=true
```

### Testing Features
- **🔧 Testing Suite**: Automated tests for all systems (APIs, storage, auth)
- **🔍 Farcaster Test**: Interactive Farcaster API testing
- **📊 Debug Panel**: Floating dev tools for quick access
- **📥 Export Debug Data**: Download system state for troubleshooting
- **🧹 Clear Storage**: Reset localStorage for clean testing

### Test Categories
1. **Environment**: API key validation
2. **Storage**: localStorage functionality 
3. **External APIs**: Farcaster and IPFS connectivity
4. **Authentication**: Sign-in flow verification

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/045bc405-1504-42c7-aed9-72790ce40337) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/045bc405-1504-42c7-aed9-72790ce40337) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
