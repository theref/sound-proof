# 🚀 SoundProof Deployment Guide

## Production Architecture

```
GitHub → Vercel → Cloud Storage
   ↓        ↓           ↓
  CI/CD   Frontend   User Data
          + API      (Serverless)
```

## 🔧 Setup Instructions

### 1. **Vercel Setup**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link Project**:
   ```bash
   vercel link
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### 2. **Environment Variables**

Set these in Vercel dashboard (vercel.com):

```bash
# Required API Keys
VITE_NEYNAR_API_KEY=your_neynar_key
VITE_LIGHTHOUSE_API_KEY=your_lighthouse_key

# Optional: Database (upgrade from in-memory)
KV_URL=your_vercel_kv_url
KV_REST_API_URL=your_vercel_kv_rest_url
KV_REST_API_TOKEN=your_vercel_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_vercel_kv_readonly_token
```

### 3. **GitHub Secrets**

Add these to your GitHub repository secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
VITE_NEYNAR_API_KEY=your_neynar_key
VITE_LIGHTHOUSE_API_KEY=your_lighthouse_key
```

### 4. **Domain Setup**

1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 📦 Data Persistence

### Current (MVP)
- **Development**: localStorage
- **Production**: In-memory API storage (resets on deployment)

### Upgrade Options
1. **Vercel KV** (Redis) - Recommended
2. **Supabase** (PostgreSQL)  
3. **Firebase Firestore**

## 🔄 Deployment Workflow

### Automatic Deployment
```
git push origin main → GitHub Actions → Vercel Production
```

### Manual Deployment  
```bash
npm run deploy
```

## 🐛 Troubleshooting

### Build Failures
1. Check TypeScript errors: `npx tsc --noEmit`
2. Check environment variables in Vercel
3. Verify API keys are valid

### Runtime Errors
1. Check Vercel Function logs
2. Verify CORS configuration
3. Check browser console for client errors

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Console Logs**: Available in Vercel Functions dashboard
- **Error Tracking**: Consider adding Sentry for production

## 🔐 Security

- ✅ API keys properly configured as secrets
- ✅ CORS headers configured
- ✅ Debug mode disabled in production
- ⚠️ In-memory storage (upgrade for production)

## 🚀 Going Live Checklist

- [ ] Domain configured
- [ ] API keys set in production  
- [ ] SSL certificate active
- [ ] Debug mode hidden in production
- [ ] User data persistence working
- [ ] Error monitoring setup
- [ ] Performance monitoring active

## 🔄 Upgrade Path

1. **Now**: Basic deployment with in-memory storage
2. **Phase 1**: Add Vercel KV for persistent storage
3. **Phase 2**: Add proper user authentication
4. **Phase 3**: Scale to multiple regions