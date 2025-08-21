# NameSweep - Claude Development Guide

## Project Overview
NameSweep is an instant brand name availability checker for domains, social media, trademarks, and SEO collision detection. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Quick Start
```bash
npm run dev     # Start dev server (port 3002)
npm run build   # Build for production
npm run lint    # Run ESLint
npm run typecheck # Run TypeScript checks
```

## Visual Development Workflow
When making UI changes, I will:
1. Use Playwright MCP to navigate to affected pages
2. Take screenshots for visual verification
3. Check browser console for errors
4. Compare against design principles and style guide
5. Iterate until designs match specifications

## Key Files & Directories
```
/app              # Next.js app router
  /api            # API routes
    /check        # Main domain checking endpoint
    /social-check # Social media availability
/components       # React components
/lib              # Services and utilities
  /services       # API integrations
  /helpers        # Helper functions
/.claude          # Claude-specific configuration
  /agents         # Specialized AI agents
  /commands       # Custom commands
  /context        # Design principles & style guide
```

## API Keys & Environment
Located in `.env.local`:
- `OPENAI_API_KEY` - For AI-powered suggestions
- `RAPIDAPI_DOMAINR_KEY` - For domain availability checking (Domainr API)
- `PORKBUN_API_KEY` & `PORKBUN_SECRET_KEY` - For domain pricing
- `SERPAPI_KEY` - For SEO and trademark searches

## Current Features
✅ Domain availability checking (.com, .co, .io, .net + extended TLDs)
✅ Social media handle checking (Instagram, X, YouTube, TikTok, GitHub, LinkedIn, Reddit)
✅ USPTO trademark search
✅ SEO competition analysis
✅ AI-powered name suggestions
✅ Smart caching (24-hour)
✅ Real-time pattern matching for social media

## Testing Approach
1. **Visual Testing**: Use Playwright MCP for UI verification
2. **API Testing**: Test scripts in root directory
   - `node test-full-system.js` - Complete system integration test
   - `node test-performance.js` - Performance benchmarking
   - `node test-social-endpoints.js` - Social API verification
   - `node test-social-api.js` - Social checker functionality
   - `node test-playwright-mcp.js` - Playwright MCP integration
3. **Type Safety**: Run `npm run typecheck`
4. **Linting**: Run `npm run lint`

## Design System
- **Primary Color**: #3B82F6 (Blue)
- **Secondary Color**: #10B981 (Green)
- **Font**: Inter
- **Spacing Scale**: 4px base (4, 8, 16, 24, 32, 48, 64)
- **Border Radius**: 8px for buttons, 12px for cards

## Common Tasks

### Adding a New Social Platform
1. Add checker in `/app/api/social-check/[platform]/route.ts`
2. Update platform config in `/lib/services/social-checker.ts`
3. Add to UI component in `/components/social-availability.tsx`

### Improving Domain Checking
1. Main logic in `/lib/services/domainr-api.ts`
2. Fallback services in `/lib/services/porkbun.ts`
3. Cache logic in `/lib/helpers/cache.ts`

### Testing the Full System
1. Run `node test-full-system.js` for comprehensive testing
2. Check performance with `node test-performance.js`
3. Verify all social endpoints with `node test-social-endpoints.js`

### UI Changes
1. Always reference `.claude/context/design-principles.md`
2. Follow `.claude/context/style-guide.md`
3. Use Playwright to verify visual changes
4. Take before/after screenshots

### Cache Management
1. Domain checks cached for 24 hours in `/lib/helpers/cache.ts`
2. Social checks use real-time pattern matching + API verification
3. Clear cache by restarting dev server if needed

## Performance Considerations
- API responses are cached for 24 hours
- Social checks use pattern matching for instant feedback
- Real API calls happen in background
- Batch requests when possible (max 3 concurrent)
- AI name generation optimized from 120s to ~12s
- Parallel API calls for social platform checks
- Porkbun provides fallback when Domainr is unavailable
- Domain pricing fetched from Porkbun API

## Deployment
Deployed on Vercel:
- Production: https://namesweep-fhjn4dw0o-tony-s-projects-5379dbd0.vercel.app
- Auto-deploys from main branch
- Environment variables set in Vercel dashboard
- **Important**: Build must pass TypeScript checks (`npm run typecheck`)
- Deploy with `vercel` command for manual deployment

## Important Notes
- Don't commit API keys
- Always test with `npm run typecheck` before committing
- Use extended TLDs toggle for AI-suggested domains
- Social media checks have confidence levels (High/Medium/Low)
- Some platforms require manual verification due to API limitations
- **Social Platform Reliability**:
  - Instagram/X: Pattern-based checking (instant but requires verification)
  - YouTube/TikTok/GitHub/LinkedIn/Reddit: Real API calls
  - Confidence levels indicate certainty of availability
- WHOIS data cached for 24 hours to prevent rate limiting
- Domain suggestions use OpenAI GPT-4 for quality results