# NameSweep v0.2 - AI-Powered Brand Name Generator & Checker

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Copy `.env.example` to `.env.local` and add your API keys:

```env
# Required APIs
PORKBUN_API_KEY=your_key_here
PORKBUN_API_SECRET=your_secret_here
OPENAI_API_KEY=your_openai_key
SERPAPI_KEY=your_serpapi_key

# Optional - for caching
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)**

## ✨ New Features in v0.2

### 🤖 AI-Powered Name Generation
- **Chat Mode**: Describe your business in natural language
- **Smart Generation**: Creates 40-60 candidates, filters to top 10
- **Multiple Styles**: Descriptive, suggestive, coined, blends, metaphorical

### 🔍 Enhanced Checking
- **Porkbun Integration**: Real-time domain availability with premium pricing
- **SerpAPI**: Advanced SERP analysis and USPTO trademark searches
- **Extended TLDs**: Toggle to check 10+ additional TLDs (.ai, .app, .dev, etc.)
- **Social Expansion**: Now includes TikTok and Substack checks

### 📊 BrandFit Scoring
- **Weighted Algorithm**: 
  - Domain Availability: 40%
  - SEO Competition: 25%
  - Trademark Status: 15%
  - Social Availability: 15%
  - Business Fit: 5%
- **Visual Scoring**: See subscores and explanations for each name

### 💼 Professional Features
- **Compare Mode**: Select up to 4 names for side-by-side comparison
- **Export Options**: Download results as CSV or Markdown
- **Smart Caching**: 24-hour cache for repeated searches
- **Performance Optimized**: P95 < 3s for first results

## 🎯 Two Modes

### Mode 1: Check a Name
Traditional single-name checker with instant results across:
- Domain availability (.com, .co, .io, .net + extended)
- Social media handles (X, Instagram, YouTube, TikTok, Substack)
- USPTO trademark status
- SEO competition analysis

### Mode 2: Generate Names (NEW!)
AI-powered generator that:
1. Takes your business description
2. Generates diverse name candidates
3. Runs availability checks
4. Returns top 10 with full analysis

## 🛠️ Technical Stack

- **Framework**: Next.js 15.4 with App Router
- **UI**: Tailwind CSS with custom animations
- **APIs**: 
  - OpenAI (gpt-4o-mini) for generation
  - Porkbun for domains
  - SerpAPI for SERP/USPTO
- **Caching**: Vercel KV Store
- **Edge Runtime**: Optimized for global performance

## 📝 Configuration

### Environment Variables
```env
# Model Selection (optional)
OPENAI_MODEL=gpt-4o-mini  # or o3-mini, o5-mini when available

# Scoring Weights (optional, defaults shown)
SCORE_WEIGHT_AVAILABILITY=40
SCORE_WEIGHT_SEO=25
SCORE_WEIGHT_TRADEMARK=15
SCORE_WEIGHT_SOCIAL=15
SCORE_WEIGHT_FIT=5

# Premium Domain Threshold
PREMIUM_THRESHOLD=249  # Domains over this price marked as premium
```

## 🚦 API Requirements

### Porkbun (Domain Checking)
- Sign up at [porkbun.com](https://porkbun.com/account/api)
- Generate API key and secret
- No IP allowlist needed

### OpenAI (Name Generation)
- Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
- Uses gpt-4o-mini by default
- ~$0.001-0.002 per generation

### SerpAPI (SERP & USPTO)
- Sign up at [serpapi.com](https://serpapi.com/)
- Free tier includes 100 searches/month
- Handles both web search and USPTO lookups

## 📊 Performance Metrics

- **Time to First Result**: P95 < 3 seconds
- **Full Grid Completion**: P95 < 6 seconds
- **Cost per Query**: < $0.05 (with caching)
- **Cache Hit Rate**: ~40% in production

## 🔒 Compliance & Legal

- **Trademark Disclaimer**: Shows exact-match only, not legal advice
- **Social Checks**: User-initiated to comply with platform ToS
- **Data Privacy**: No PII stored, only brand names cached
- **SERP Attribution**: Results sourced via compliant API

## 🐛 Troubleshooting

### Build Errors
```bash
npm run build  # Check for TypeScript errors
npm run lint   # Check for linting issues
```

### API Issues
- Verify all API keys are set in `.env.local`
- Check API rate limits and quotas
- Ensure APIs are enabled/activated in provider dashboards

### Performance
- Enable Vercel KV for caching
- Use extended TLD check sparingly (adds latency)
- Consider implementing request queuing for high volume

## 📈 Future Enhancements

- [ ] Webhook support for async processing
- [ ] Bulk name checking via CSV upload
- [ ] Historical availability tracking
- [ ] Custom scoring weight profiles
- [ ] International domain support
- [ ] Logo generation integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a pull request

## 📄 License

Private repository - all rights reserved

---

Built with ❤️ by the NameSweep team