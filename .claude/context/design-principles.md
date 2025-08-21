# Design Principles

## Core Philosophy
Following shadcn/ui's approach: **Beautiful, modern, and accessible by default**
- Minimalist aesthetic with purposeful use of space
- Component-based architecture using shadcn/ui primitives
- Typography-first hierarchy following shadcn.com patterns
- Lucide icons exclusively for consistent visual language

## Typography Hierarchy (shadcn Style)
- **Display**: 4xl-5xl for hero sections (tracking-tight)
- **Headings**: Consistent scale with clear weight differences
  - h1: text-4xl font-bold tracking-tight
  - h2: text-3xl font-semibold tracking-tight
  - h3: text-2xl font-semibold
  - h4: text-xl font-semibold
  - h5: text-lg font-semibold
- **Body**: text-base with relaxed line-height for readability
- **Small/Muted**: text-sm text-muted-foreground for secondary content
- **Monospace**: For code, domains, and technical content

## Color System
- **Primary**: #3B82F6 (Blue - Trust & Technology)
- **Secondary**: #10B981 (Green - Success & Availability)
- **Destructive**: #EF4444 (Red - Errors/Unavailable)
- **Warning**: #F59E0B (Orange - Premium/Caution)
- **Muted**: Neutral grays for secondary content
- **Background/Foreground**: System-aware light/dark mode
- Extended color scales (50-950) for nuanced UI states

## Component Standards (shadcn/ui)
- **Buttons**: 
  - Variants: default, secondary, destructive, outline, ghost, link
  - Sizes: sm, default, lg, icon
  - Subtle hover states (no translateY, use background/opacity changes)
- **Cards**: Clean borders, minimal shadows, consistent padding
- **Forms**: Clear labels, subtle focus states, inline validation
- **Dialogs/Sheets**: Overlay patterns for focused interactions
- **Tables**: Clean data presentation with sortable headers
- **Navigation**: Tabs, breadcrumbs, command menu patterns

## Spacing & Layout
- Consistent spacing scale: 4px base (1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24)
- Container max-widths for readable content
- Responsive grid systems with breakpoint-aware layouts
- Generous whitespace for visual breathing room

## Icon System (Lucide)
- **Consistent sizing**: 16px (sm), 20px (default), 24px (lg)
- **Stroke width**: 2px for all icons
- **Usage patterns**:
  - Navigation: ChevronRight, Menu, X
  - Actions: Search, Copy, Download, Share
  - Status: Check, X, AlertCircle, Info
  - No emoji usage - Lucide icons only
- **Animation**: Subtle transitions, no excessive motion

## Interaction Patterns
- **Hover states**: Subtle background/border color changes
- **Focus states**: Visible ring for accessibility (ring-2 ring-offset-2)
- **Loading states**: Skeleton loaders and subtle spinners
- **Transitions**: 150ms for fast, 200ms for standard interactions
- **Feedback**: Toast notifications for actions, inline for forms

## Accessibility Standards
- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all interactive elements
- Proper ARIA labels and semantic HTML
- Focus-visible for keyboard users
- Color contrast ratios (4.5:1 normal, 3:1 large text)
- Screen reader friendly component structure

## Performance Standards
- Component lazy loading where appropriate
- Optimized bundle sizes with tree-shaking
- Smooth 60fps animations
- Fast initial paint (<2s)
- Responsive interactions (<100ms feedback)

## Dark Mode Support
- CSS variables for theme switching
- System preference detection
- Consistent contrast in both themes
- Proper color inversion for readability

## Brand Personality
- **Professional**: Clean, trustworthy, enterprise-ready
- **Modern**: Current but timeless, not trendy
- **Efficient**: Fast, streamlined, zero friction
- **Accessible**: Inclusive design for all users
- **Elegant**: Sophisticated simplicity like shadcn.com