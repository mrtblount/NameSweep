# Project Configuration

## Visual Development
When working on front-end changes, automatically:
1. Navigate to affected pages using Playwright
2. Take screenshots for visual verification
3. Check browser console for errors
4. Compare against design principles and style guide
5. Iterate until designs match specifications

### Verification Process
- Reference `/context/design-principles.md` for design standards
- Reference `/context/style-guide.md` for specific styling rules
- Check acceptance criteria from user prompts
- Use desktop viewport (1920x1080) by default
- Always check console for errors after changes

### Comprehensive Design Review
For PRs or significant UI changes:
- Run the @agent design-reviewer
- Document all visual changes with screenshots
- Check accessibility and responsive design
- Verify against style guide

### Important Rules
- Do not introduce new frameworks without explicit permission
- Always use Playwright to verify visual changes
- Take before/after screenshots for comparisons
- Check mobile, tablet, and desktop viewports when requested

## Testing Commands
- `npm run dev` - Start development server (port 3002)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure
- `/app` - Next.js app router pages and API routes
- `/components` - React components
- `/lib` - Utility functions and services
- `/public` - Static assets
- `/.claude` - Claude-specific configuration and agents