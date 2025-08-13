# 🚀 Quick Testing Guide

## 1. Start Development Server

```bash
npm install
npm run dev
```

## 2. Access Developer Tools

Visit: **http://localhost:8080?debug=true**

This enables:
- 🧪 **Testing Suite** - Complete system tests
- 🔍 **Farcaster Test** - API connectivity tests  
- 🛠️ **Debug Tools** - Floating dev panel

## 3. Required API Keys

Add to `.env`:
```bash
VITE_NEYNAR_API_KEY=your_neynar_api_key
VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
```

Get keys from:
- [Neynar](https://neynar.com/) (Farcaster API)
- [Lighthouse](https://lighthouse.storage/) (IPFS storage)

## 4. Quick Verification

1. **Click "Testing Suite"** in debug panel
2. **Click "Run All Tests"**
3. ✅ All tests should pass
4. If any fail, check console for details

## 5. Manual Testing Flow

1. **Sign In**: Use your Farcaster account + verified wallet
2. **Upload**: Try a small MP3 file
3. **Play**: Click play on uploaded track
4. **Refresh**: Verify data persists

## 🐛 Common Issues

- **"API key not found"**: Check `.env` file and restart server
- **"User not found"**: Verify username is correct (no @ symbol)
- **"Wallet not verified"**: Add wallet to Farcaster profile at warpcast.com

## 📚 Full Documentation

- [TESTING.md](./TESTING.md) - Complete testing guide
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System documentation

---

**🎵 You're ready to test SoundProof!**