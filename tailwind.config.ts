import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Unbound','Unbounded','Plus Jakarta Sans','Inter','system-ui','sans-serif'],
        sans: ['Plus Jakarta Sans','Inter','system-ui','-apple-system','Segoe UI','Roboto','sans-serif'],
      },
      colors: {
        ns: {
          bg: '#0D0D0D',
          surface: '#111111',
          surface2: '#171717',   // Chinese Black
          text: '#FAFAFA',       // Lotion
          mute: '#575757',       // Davy's Grey
          accent: '#D4FF4A',     // Maximum Green Yellow
          accent2: '#A8F500',    // Spring Bud
        },
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        pill: '9999px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(168,245,0,.28), 0 10px 30px rgba(212,255,74,.20), inset 0 -1px 0 rgba(255,255,255,.04)',
        soft: '0 1px 0 rgba(255,255,255,.06), 0 8px 24px rgba(0,0,0,.45)',
        'glow-hover': '0 0 0 1px rgba(168,245,0,.4), 0 15px 40px rgba(212,255,74,.3), inset 0 -1px 0 rgba(255,255,255,.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,.6), 0 2px 8px rgba(212,255,74,.1)',
      },
      backgroundImage: {
        'halo-arc': 'radial-gradient(90% 60% at 50% 0%, rgba(212,255,74,.35) 0%, rgba(168,245,0,.18) 20%, rgba(0,0,0,0) 60%)',
        'dot-grid': 'radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)',
        'glass': 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))',
        'noise': 'url(/textures/noise.png)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundSize: {
        grid: '22px 22px',
      },
      animation: {
        float: 'float 10s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        slowPan: 'slowPan 32s linear infinite',
        fadeUp: 'fadeUp .75s ease-out both',
        fadeIn: 'fadeIn .6s ease-out both',
        slideUp: 'slideUp .8s ease-out both',
        slideInLeft: 'slideInLeft .8s ease-out both',
        slideInRight: 'slideInRight .8s ease-out both',
        scaleIn: 'scaleIn .6s ease-out both',
        bounceIn: 'bounceIn .8s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
        rotate: 'rotate 20s linear infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        float: { 
          '0%,100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-4px)' } 
        },
        pulseGlow: { 
          '0%,100%': { filter: 'drop-shadow(0 0 0 rgba(212,255,74,0))' }, 
          '50%': { filter: 'drop-shadow(0 0 18px rgba(212,255,74,.35))' } 
        },
        slowPan: { 
          '0%': { backgroundPosition: '0 0' }, 
          '100%': { backgroundPosition: '420px 220px' } 
        },
        fadeUp: { 
          '0%': { opacity: '0', transform: 'translateY(20px)' }, 
          '100%': { opacity: '1', transform: 'translateY(0)' } 
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' }
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' }
        },
        'gradient-y': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'center top' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'center bottom' }
        },
        'gradient-xy': {
          '0%, 100%': { 'background-size': '400% 400%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' }
        }
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      container: { 
        center: true, 
        screens: { 
          sm:'640px', 
          md:'768px', 
          lg:'1024px', 
          xl:'1200px', 
          '2xl':'1320px' 
        } 
      },
    }
  },
  plugins: [],
}

export default config