# 🚀 Deploy NameSweep to Vercel

## Prerequisites
✅ Build successful (confirmed)
✅ Vercel account (free at vercel.com)
✅ Git repository (GitHub/GitLab/Bitbucket)

## Option 1: Deploy via Vercel CLI (Recommended)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel
```

Follow the prompts:
- Link to existing project? **No** (first time)
- What's your project name? **namesweep** (or your choice)
- In which directory is your code? **./** (current directory)
- Want to override settings? **No**

### 3. Set Environment Variables
```bash
# Set your OpenAI key (REQUIRED for name generation)
vercel env add OPENAI_API_KEY

# Optional: Add other APIs for full functionality
vercel env add PORKBUN_API_KEY
vercel env add PORKBUN_API_SECRET
vercel env add SERPAPI_KEY
```

### 4. Deploy to Production
```bash
vercel --prod
```

---

## Option 2: Deploy via GitHub Integration

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy NameSweep v0.2 to Vercel"
git push origin main
```

### 2. Import on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your NameSweep repository
4. Configure project:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: **./** (leave as is)
   - Build Command: `npm run build` (auto-detected)

### 3. Add Environment Variables
In Vercel Dashboard > Settings > Environment Variables:

**Required for AI Generation:**
```
OPENAI_API_KEY=sk-proj-...your-key...
```

**Optional for Full Checks:**
```
PORKBUN_API_KEY=your-key
PORKBUN_API_SECRET=your-secret
SERPAPI_KEY=your-key
```

### 4. Deploy
Click **Deploy** - Vercel will build and deploy automatically!

---

## 🔧 Environment Variables Setup

### Minimum Setup (AI Generation Only)
```env
OPENAI_API_KEY=sk-proj-...
```

### Full Setup (All Features)
```env
# AI Generation
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Domain Checks
PORKBUN_API_KEY=...
PORKBUN_API_SECRET=...

# SEO & USPTO
SERPAPI_KEY=...

# Configuration
PREMIUM_THRESHOLD=249
SCORE_WEIGHT_AVAILABILITY=40
SCORE_WEIGHT_SOCIAL=15
SCORE_WEIGHT_SEO=25
SCORE_WEIGHT_TRADEMARK=15
SCORE_WEIGHT_FIT=5
```

---

## 📦 Optional: Add Vercel KV for Caching

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → **KV**
3. Name it (e.g., "namesweep-cache")
4. Click **Create**
5. Environment variables are auto-added:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

This enables caching to reduce API costs!

---

## 🌍 Your Deployed URLs

After deployment, you'll get:
- **Production:** `https://namesweep.vercel.app`
- **Preview:** `https://namesweep-git-main.vercel.app`
- **Custom Domain:** Add in Settings > Domains

---

## ✅ Post-Deployment Checklist

1. **Test "Check a name" mode**
   - Enter a brand name
   - Verify domain checks work
   - Check social media links open

2. **Test "Describe Business" mode**
   - Enter business description
   - Verify AI generates names
   - Click expand to see full checks

3. **Monitor Usage**
   - Vercel Dashboard > Analytics
   - OpenAI Dashboard > Usage
   - Check API limits

---

## 🚨 Troubleshooting

### "Failed to generate names"
- Check `OPENAI_API_KEY` is set correctly
- Verify OpenAI account has credits
- Check Vercel Functions logs

### Domain checks show mock data
- Add `PORKBUN_API_KEY` and `PORKBUN_API_SECRET`
- Get free API key at porkbun.com

### SEO/USPTO shows placeholder data
- Add `SERPAPI_KEY`
- Get free tier at serpapi.com

### Functions timeout
- Edge functions have 30s limit
- Consider upgrading Vercel plan for longer timeouts

---

## 📊 Monitor Your App

### Vercel Dashboard
- **Analytics:** Traffic, performance metrics
- **Functions:** API usage, errors
- **Logs:** Real-time function logs

### API Dashboards
- **OpenAI:** platform.openai.com/usage
- **Porkbun:** porkbun.com/account
- **SerpAPI:** serpapi.com/dashboard

---

## 🎉 Success!

Your NameSweep app is now live! Share your URL and start checking names.

**Next Steps:**
1. Add custom domain (optional)
2. Set up monitoring alerts
3. Add more API keys for full functionality
4. Consider Vercel Pro for advanced features

---

## Quick Deploy Commands Summary

```bash
# First time deploy
vercel

# Add environment variable
vercel env add OPENAI_API_KEY

# Deploy to production
vercel --prod

# View deployment
vercel ls

# View logs
vercel logs
```

---

**Need help?** Check Vercel docs at [vercel.com/docs](https://vercel.com/docs)