import type { Config } from 'tailwindcss';

/**
 * Design tokens for the "glowing glassmorphism" dark theme.
 * Colors, glows, blurs and motion live here so components stay declarative.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          black: '#000000',
          900: '#0a0a0a',
          850: '#121212',
          800: '#181818',
          700: '#1f1f1f',
          600: '#282828',
          500: '#3e3e3e',
        },
        neon: {
          DEFAULT: '#1DB954',
          50: '#e9fbef',
          100: '#c9f6d8',
          200: '#93edb1',
          300: '#5ce38a',
          400: '#2fd96a',
          500: '#1DB954',
          600: '#169443',
          700: '#106f32',
          800: '#0b4a22',
          900: '#052511',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-xs': '0 0 8px rgba(29, 185, 84, 0.35)',
        'glow-sm': '0 0 12px rgba(29, 185, 84, 0.45), 0 0 2px rgba(29, 185, 84, 0.8)',
        glow: '0 0 24px rgba(29, 185, 84, 0.45), 0 0 4px rgba(29, 185, 84, 0.9)',
        'glow-lg': '0 0 48px rgba(29, 185, 84, 0.45), 0 0 12px rgba(29, 185, 84, 0.6)',
        'glow-inset': 'inset 0 0 20px rgba(29, 185, 84, 0.18)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #2fd96a 0%, #1DB954 50%, #169443 100%)',
        'glass-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'radial-fade': 'radial-gradient(ellipse at top, rgba(29,185,84,0.18), transparent 60%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(29,185,84,0.35)' },
          '50%': { boxShadow: '0 0 28px rgba(29,185,84,0.75)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        equalizer: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 18s ease-in-out infinite',
        'float-slow': 'float 26s ease-in-out infinite reverse',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        equalizer: 'equalizer 0.9s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
