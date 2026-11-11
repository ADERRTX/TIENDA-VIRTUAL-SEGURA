/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        bg: '#FAF8F3',
        surface: '#FFFFFF',
        'surface-2': '#F1EEE6',
        'surface-3': '#E7E3D8',

        // Lines and dividers
        line: '#E3DED1',
        'line-soft': '#EEEADF',

        // Mint panels
        mint: {
          DEFAULT: '#DDF3EE',
          strong: '#C4E9E0',
        },

        // Petrol green anchor
        deep: {
          DEFAULT: '#0B3B3A',
          2: '#0F4F4B',
          muted: '#B9D4CF',
        },

        // Brand colors
        brand: {
          DEFAULT: '#0B7A5E',
          hover: '#085F4A',
          dark: '#0A6B52',
          ink: '#FFFFFF',
          soft: 'rgba(11, 122, 94, 0.08)',
        },

        // Sun / Warmth
        sun: {
          DEFAULT: '#F6A623',
          ink: '#2A1700',
          soft: 'rgba(246, 166, 35, 0.16)',
        },

        // Legacy accent & amber
        accent: {
          DEFAULT: '#B45309',
          dark: '#92400E',
          soft: 'rgba(180, 83, 9, 0.08)',
        },

        // Typography inks
        ink: {
          DEFAULT: '#12211F',
          muted: '#4B5E5A',
          faint: '#8A9B97',
        },

        // Semantics (only for states and alerts)
        success: {
          DEFAULT: '#166534',
          soft: 'rgba(22, 101, 52, 0.08)',
          border: 'rgba(22, 101, 52, 0.3)',
        },
        warning: {
          DEFAULT: '#92400E',
          soft: 'rgba(146, 64, 14, 0.08)',
          border: 'rgba(146, 64, 14, 0.3)',
        },
        danger: {
          DEFAULT: '#B91C1C',
          soft: 'rgba(185, 28, 28, 0.08)',
          border: 'rgba(185, 28, 28, 0.3)',
        },
        info: {
          DEFAULT: '#1D4ED8',
          soft: 'rgba(29, 78, 216, 0.08)',
          border: 'rgba(29, 78, 216, 0.3)',
        },

        // Legacy status mapping
        status: {
          ok: '#166534',
          danger: '#B91C1C',
          warning: '#92400E',
          info: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['Georgia', '"Times New Roman"', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        lg: '0 10px 25px -3px rgba(11, 33, 31, 0.08), 0 4px 10px -4px rgba(11, 33, 31, 0.04)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms ease-out forwards',
        'slide-up': 'slide-up 250ms ease-out forwards',
        'scale-in': 'scale-in 200ms ease-out forwards',
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
};
