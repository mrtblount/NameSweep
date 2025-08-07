# NameSweep

Instant brand name availability checker for domains, social media, trademarks, and SEO collision detection.

## Features

- **Domain Availability**: Checks .com, .co, .io, .net domains with premium domain detection
- **Social Media Handles**: Verifies availability on X (Twitter), Instagram, and YouTube
- **USPTO Trademark Search**: Scans for existing US trademarks
- **Real-Time SEO Analysis**: Fetches actual Google search results and uses o3-mini AI to analyze competition
- **AI Recommendations**: o3-mini generates 5 alternative brand names with one-click checking
- **Smart Caching**: 24-hour cache for faster repeated searches
- **Modern UI**: Built with Next.js 14 and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **API**: Vercel Edge Functions
- **Caching**: Vercel KV
- **APIs Used**:
  - GoDaddy Domain Availability API
  - OpenAI API (o3-mini model for intelligent SEO analysis and recommendations)
  - Google Custom Search API or SerpAPI (for real-time Google search results)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/namesweep.git
cd namesweep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
GODADDY_API_KEY=your_godaddy_api_key
OPENAI_API_KEY=your_openai_api_key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## API Keys Required

- **GoDaddy API**: Get your key from [developer.godaddy.com](https://developer.godaddy.com/)
- **OpenAI API**: Get your key from [platform.openai.com](https://platform.openai.com/api-keys) (requires o3-mini access)
- **Google Search** (choose one):
  - **Google Custom Search API**: Create at [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) and [programmablesearchengine.google.com](https://programmablesearchengine.google.com/)
  - **SerpAPI** (easier alternative): Get key from [serpapi.com](https://serpapi.com/)
- **Vercel KV**: Automatically configured when deploying to Vercel

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/namesweep)

Remember to add your environment variables in the Vercel dashboard.

## How It Works

1. Enter a brand name in the search field
2. The app checks availability across:
   - Domain TLDs (.com, .co, .io, .net)
   - Social media platforms (X, Instagram, YouTube)
   - USPTO trademark database
   - Google search results for SEO conflicts
3. Results are cached for 24 hours for faster subsequent searches
4. Get instant recommendations based on availability

## Status Indicators

- ✅ **Available**: Free to register/use
- ⚠️ **Premium**: Domain available but expensive (≥$250)
- ❌ **Taken**: Already registered/in use

## License

MIT
