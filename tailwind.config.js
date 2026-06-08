/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#09090f',
          900: '#0f0f1a',
          800: '#161625',
          700: '#1e1e32',
          600: '#2a2a45',
        },
        volt: {
          500: '#b8ff47',
          400: '#caff6b',
          300: '#dcff9a',
        },
        azure: {
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
        },
        coral: {
          500: '#ff6b6b',
          400: '#ff8f8f',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
