/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette Palantir-style
        'palantir': {
          'bg': '#0a0e14',
          'surface': '#0d1117',
          'card': '#151b23',
          'border': '#21262d',
          'hover': '#1c2129',
          'accent': '#2ea043',
          'accent-hover': '#3fb950',
          'text': '#c9d1d9',
          'text-muted': '#8b949e',
          'danger': '#f85149',
          'warning': '#d29922',
          'info': '#58a6ff',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
        'display': ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(46, 160, 67, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(46, 160, 67, 0.4)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
