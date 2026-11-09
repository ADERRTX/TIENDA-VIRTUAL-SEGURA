/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        bg: '#0A1020',
        surface: '#0F1A2E',
        'surface-2': '#14233B',
        'surface-3': '#1B2D4A',

        // Lines and dividers
        line: '#24385A',
        'line-soft': '#182842',

        // Brand colors (Teal accent 10%)
        brand: {
          DEFAULT: '#2DD4BF',
          hover: '#5EEAD4',
          dark: '#14B8A6',
          ink: '#04121F',
          soft: 'rgba(45, 212, 191, 0.12)',
        },

        // Legacy accent & amber
        accent: {
          DEFAULT: '#FBBF24',
          dark: '#D97706',
          soft: 'rgba(251, 191, 36, 0.12)',
        },

        // Typography inks
        ink: {
          DEFAULT: '#E8EEF7',
          muted: '#9FB0C8',
          faint: '#6F819C',
        },

        // Semantics (only for states and alerts)
        success: {
          DEFAULT: '#4ADE80',
          soft: 'rgba(74, 222, 128, 0.12)',
          border: 'rgba(74, 222, 128, 0.25)',
        },
        warning: {
          DEFAULT: '#FBBF24',
          soft: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.25)',
        },
        danger: {
          DEFAULT: '#F87171',
          soft: 'rgba(248, 113, 113, 0.12)',
          border: 'rgba(248, 113, 113, 0.25)',
        },
        info: {
          DEFAULT: '#60A5FA',
          soft: 'rgba(96, 165, 250, 0.12)',
          border: 'rgba(96, 165, 250, 0.25)',
        },

        // Legacy status mapping
        status: {
          ok: '#4ADE80',
          danger: '#F87171',
          warning: '#FBBF24',
          info: '#60A5FA',
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
        sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 25px -3px rgba(0, 0, 0, 0.5), 0 4px 10px -4px rgba(0, 0, 0, 0.4)',
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
