/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '420px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Pleurat Editorial Warm Amber & Linen Palette
        ocher: {
          50: '#FDF8F0',
          100: '#FBF0E0',
          200: '#F6DEC1',
          300: '#F1CCA1',
          400: '#F3B250',
          500: '#EAA036', // Signature Pleurat Amber Gold
          600: '#DF9126',
          700: '#B97316',
          800: '#935810',
          900: '#75440C',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F7F5F0', // Warm Linen Page Canvas
          300: '#EBE7DF',
          400: '#E5E0D8', // Architectural Border
          500: '#D5D0C7', // Dotted Grid Color
          600: '#A49F96',
          700: '#787571', // Editorial Stone Dual-Tone Gray
          800: '#4A4744', // Dark Charcoal Body
          900: '#161514', // Rich Espresso Headings
        }
      },
      fontFamily: {
        sans: ['Satoshi', 'General Sans', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Satoshi', 'General Sans', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        }
      }
    },
  },
  plugins: [],
}
