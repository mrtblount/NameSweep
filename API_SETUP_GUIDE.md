# 🔑 NameSweep API Setup Guide

## Required APIs for v0.2

Based on the implementation, you need **3 APIs** for full functionality:

### 1. **Porkbun API** ✅ REQUIRED
**Purpose:** Domain availability checking with premium pricing  
**Cost:** FREE API access  
**Setup Time:** 2 minutes  

1. Go to [porkbun.com](https://porkbun.com)
2. Create an account (free)
3. Go to [Account → API Access](https://porkbun.com/account/api)
4. Generate API Key and Secret Key
5. Add to `.env.local`:
```env
PORKBUN_API_KEY=your_api_key_here
PORKBUN_API_SECRET=your_secret_key_here
```

**Why Porkbun?**
- No IP allowlist required
- Simple signup process
- Returns premium domain pricing
- Reliable and fast API

---

### 2. **OpenAI API** ✅ REQUIRED (for Generate mode)
**Purpose:** AI-powered name generation  
**Cost:** ~$0.001-0.002 per generation  
**Setup Time:** 3 minutes  

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create new secret key
5. Add $5-10 credit to your account (Settings → Billing)
6. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-...your_key_here
OPENAI_MODEL=gpt-4o-mini  # Optional, this is the default
```

**Cost Breakdown:**
- Each name generation: ~$0.001-0.002
- 1000 generations = ~$1-2
- Caching reduces repeated costs

---

### 3. **SerpAPI** ✅ REQUIRED
**Purpose:** SEO competition analysis + USPTO trademark search  
**Cost:** FREE tier (100 searches/month) or $50/month for 5000 searches  
**Setup Time:** 2 minutes  

1. Go to [serpapi.com](https://serpapi.com)
2. Sign up for free account
3. Get your API key from dashboard
4. Add to `.env.local`:
```env
SERPAPI_KEY=your_serpapi_key_here
```

**Free Tier Limits:**
- 100 searches per month
- Each name check uses 2 searches (SEO + USPTO)
- = 50 name checks per month free

---

## Optional APIs

### 4. **Vercel KV** (Optional but Recommended)
**Purpose:** Caching results to reduce API costs  
**Cost:** FREE tier available  
**Setup:** Automatic if deploying to Vercel  

If using Vercel:
1. Deploy to Vercel
2. Go to Storage tab
3. Create KV database
4. Keys auto-added to environment

For local development:
```env
KV_REST_API_URL=https://...vercel.kv.io
KV_REST_API_TOKEN=your_token_here
```

---

## 💰 Cost Summary

### Minimal Setup (Check mode only)
- **Porkbun:** FREE
- **SerpAPI:** FREE (100 searches/month)
- **Total:** $0/month for up to 50 checks

### Full Setup (Check + Generate modes)
- **Porkbun:** FREE
- **OpenAI:** Pay-as-you-go (~$0.002 per generation)
- **SerpAPI:** FREE tier or $50/month for heavy usage
- **Total:** ~$5-10/month for moderate usage

### Production Setup
- **Porkbun:** FREE
- **OpenAI:** ~$20-50/month (10k-25k generations)
- **SerpAPI:** $50/month (5000 searches)
- **Vercel KV:** $0-10/month
- **Total:** ~$70-110/month for production app

---

## 🚀 Quick Start

1. **Copy the example environment file:**
```bash
cp .env.example .env.local
```

2. **Add your API keys to `.env.local`:**
```env
# Minimum required for basic functionality
PORKBUN_API_KEY=your_key
PORKBUN_API_SECRET=your_secret
SERPAPI_KEY=your_key

# Required for AI generation
OPENAI_API_KEY=sk-...your_key

# Optional for caching
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

3. **Test your setup:**
```bash
npm run dev
```
- Try checking a name (e.g., "testbrand")
- If using OpenAI, try the "Describe Business" mode

---

## ❓ FAQ

### Q: Can I use without all APIs?
**A:** Yes, but with limited functionality:
- Without Porkbun: No domain checking (falls back to basic DNS check)
- Without OpenAI: No AI name generation (Check mode only)
- Without SerpAPI: No SEO/USPTO data

### Q: Which APIs are absolutely essential?
**A:** For basic name checking: Porkbun + SerpAPI
For AI generation: Add OpenAI

### Q: How can I reduce costs?
**A:** 
1. Enable caching with Vercel KV
2. Use SerpAPI free tier (100 searches/month)
3. Set conservative OpenAI usage limits
4. Cache results for 24-48 hours

### Q: Can I use alternative APIs?
**A:** Yes, but you'll need to modify the code:
- GoDaddy instead of Porkbun (see `/lib/helpers/domains.ts`)
- Google Custom Search instead of SerpAPI (more complex setup)
- Claude/Gemini instead of OpenAI (modify `/lib/services/openai-generator.ts`)

---

## 🔧 Troubleshooting

### "Invalid API Key" errors
- Double-check keys are copied correctly
- Ensure no extra spaces or quotes
- Verify API is activated in provider dashboard

### "Rate limit exceeded"
- Check your API tier limits
- Enable caching to reduce API calls
- Upgrade to paid tier if needed

### Social checks showing "Check Required"
- This is intentional for ToS compliance
- Users must manually verify social availability
- Automated checking violates platform ToS

---

## 📞 Support

- **Porkbun Support:** support@porkbun.com
- **OpenAI Support:** [platform.openai.com/docs](https://platform.openai.com/docs)
- **SerpAPI Support:** [serpapi.com/support](https://serpapi.com/support)

---

## Next Steps

1. Set up the 3 required APIs
2. Test basic name checking
3. Test AI generation (if using OpenAI)
4. Configure caching for production
5. Monitor API usage in provider dashboards