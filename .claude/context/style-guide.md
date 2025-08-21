# Style Guide - shadcn/ui Based Design System

## Typography (shadcn/ui Scale)
```css
/* Font Family */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif;
--font-mono: "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace;

/* Font Sizes - Tailwind/shadcn Scale */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
--text-7xl: 4.5rem;      /* 72px */

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Font Weights */
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;

/* Letter Spacing */
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

## Color System (Extended Palette)
```css
/* Primary Blue Scale */
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Main Primary */
--primary-600: #2563EB;
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;
--primary-950: #172554;

/* Secondary Green Scale */
--secondary-50: #F0FDF4;
--secondary-100: #DCFCE7;
--secondary-200: #BBF7D0;
--secondary-300: #86EFAC;
--secondary-400: #4ADE80;
--secondary-500: #10B981;  /* Main Secondary */
--secondary-600: #059669;
--secondary-700: #047857;
--secondary-800: #065F46;
--secondary-900: #064E3B;
--secondary-950: #022C22;

/* Neutral/Gray Scale */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
--gray-950: #030712;

/* Semantic Colors */
--destructive: #EF4444;
--destructive-foreground: #FFFFFF;
--warning: #F59E0B;
--warning-foreground: #FFFFFF;
--success: #10B981;
--success-foreground: #FFFFFF;
--info: #3B82F6;
--info-foreground: #FFFFFF;

/* Theme Variables (Light Mode) */
--background: #FFFFFF;
--foreground: #0F172A;
--card: #FFFFFF;
--card-foreground: #0F172A;
--popover: #FFFFFF;
--popover-foreground: #0F172A;
--muted: #F1F5F9;
--muted-foreground: #64748B;
--accent: #F1F5F9;
--accent-foreground: #0F172A;
--border: #E2E8F0;
--input: #F1F5F9;
--ring: #3B82F6;

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0F0F0F;
    --foreground: #F8FAFC;
    --card: #1A1A1A;
    --card-foreground: #F8FAFC;
    --popover: #1A1A1A;
    --popover-foreground: #F8FAFC;
    --muted: #262626;
    --muted-foreground: #94A3B8;
    --accent: #262626;
    --accent-foreground: #F8FAFC;
    --border: #262626;
    --input: #262626;
  }
}
```

## Spacing System
```css
--space-0: 0;
--space-0.5: 0.125rem;   /* 2px */
--space-1: 0.25rem;      /* 4px */
--space-1.5: 0.375rem;   /* 6px */
--space-2: 0.5rem;       /* 8px */
--space-2.5: 0.625rem;   /* 10px */
--space-3: 0.75rem;      /* 12px */
--space-3.5: 0.875rem;   /* 14px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-7: 1.75rem;      /* 28px */
--space-8: 2rem;         /* 32px */
--space-9: 2.25rem;      /* 36px */
--space-10: 2.5rem;      /* 40px */
--space-11: 2.75rem;     /* 44px */
--space-12: 3rem;        /* 48px */
--space-14: 3.5rem;      /* 56px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-28: 7rem;        /* 112px */
--space-32: 8rem;        /* 128px */
```

## Border Radius (shadcn/ui)
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px - shadcn default */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;
```

## Shadows (Subtle, shadcn Style)
```css
--shadow-none: none;
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

## Component Classes (shadcn/ui Patterns)

### Buttons
```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all 150ms ease;
  focus-visible: outline-2 outline-offset-2 outline-primary;
}

/* Button Sizes */
.btn-sm {
  height: 2.25rem;  /* 36px */
  padding: 0 var(--space-3);
}

.btn-default {
  height: 2.5rem;   /* 40px */
  padding: 0 var(--space-4);
}

.btn-lg {
  height: 2.75rem;  /* 44px */
  padding: 0 var(--space-8);
}

.btn-icon {
  height: 2.5rem;
  width: 2.5rem;
}

/* Button Variants */
.btn-primary {
  background: var(--primary-500);
  color: white;
}
.btn-primary:hover {
  background: var(--primary-600);
}

.btn-secondary {
  background: var(--muted);
  color: var(--foreground);
}
.btn-secondary:hover {
  background: var(--accent);
}

.btn-destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}

.btn-outline {
  border: 1px solid var(--border);
  background: transparent;
}
.btn-outline:hover {
  background: var(--accent);
}

.btn-ghost {
  background: transparent;
}
.btn-ghost:hover {
  background: var(--accent);
}

.btn-link {
  background: transparent;
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

### Cards
```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-tight);
}

.card-description {
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  margin-top: var(--space-1.5);
}
```

### Forms (shadcn/ui Style)
```css
.input {
  height: 2.5rem;
  width: 100%;
  border: 1px solid var(--border);
  background: var(--background);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
  transition: all 150ms ease;
}

.input:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--ring);
  ring-offset: 2px;
}

.input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-none);
  margin-bottom: var(--space-2);
}

.input-error {
  border-color: var(--destructive);
}

.error-message {
  font-size: var(--text-sm);
  color: var(--destructive);
  margin-top: var(--space-2);
}
```

### Badges & Status
```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  padding: 0 var(--space-2.5);
  height: var(--space-6);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  transition: all 150ms ease;
}

.badge-default {
  background: var(--muted);
  color: var(--foreground);
}

.badge-success {
  background: var(--secondary-100);
  color: var(--secondary-700);
}

.badge-destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}

.badge-warning {
  background: var(--warning);
  color: var(--warning-foreground);
}
```

## Icons (Lucide)
```css
.icon-xs { width: 12px; height: 12px; }
.icon-sm { width: 16px; height: 16px; }
.icon-base { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
.icon-xl { width: 32px; height: 32px; }

/* Consistent stroke width */
.lucide {
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

## Animations
```css
/* Transitions */
--transition-all: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-colors: colors 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-opacity: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-transform: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Keyframes */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes skeleton {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes slideDown {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes slideUp {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

/* Skeleton Loader */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    var(--accent) 50%,
    var(--muted) 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.5s ease-in-out infinite;
}
```

## Breakpoints
```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large desktop */
```

## Container
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```