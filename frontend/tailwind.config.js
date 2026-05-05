/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#0f0f23',
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#533483',
          500: '#e94560',
          600: '#ff6b6b',
          700: '#4ecdc4',
          800: '#45b7d1',
          900: '#96ceb4'
        },
        neon: {
          pink: '#ff66b2',
          blue: '#66d9ff',
          purple: '#a866ec',
          green: '#66ffa5'
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 102, 178, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 102, 178, 0.6), 0 0 40px rgba(255, 102, 178, 0.3)' }
        }
      }
    },
  },
  plugins: [],
}
