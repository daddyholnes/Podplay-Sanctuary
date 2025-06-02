import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Podplay Sanctuary Purple Theme
        podplay: {
          50: '#faf7ff',
          100: '#f4edff',
          200: '#ebe0ff',
          300: '#dcc7ff',
          400: '#c69fff',
          500: '#b372ff',
          600: '#a855f7',
          700: '#9333ea',
          800: '#7c2d8b',
          900: '#5b2c6f',
          950: '#3b1e47',
        },
        // Mama Bear warm colors
        bear: {
          50: '#fef7f0',
          100: '#feede1',
          200: '#fcd9c2',
          300: '#f9be9e',
          400: '#f59e72',
          500: '#f2844e',
          600: '#e36f38',
          700: '#be5a30',
          800: '#98492e',
          900: '#7b3e29',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'podplay-gradient': 'linear-gradient(135deg, #faf7ff 0%, #f4edff 25%, #ebe0ff 50%, #dcc7ff 75%, #c69fff 100%)',
        'podplay-dark': 'linear-gradient(135deg, #3b1e47 0%, #5b2c6f 25%, #7c2d8b 50%, #9333ea 75%, #a855f7 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
