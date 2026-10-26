/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#090F1E',
        surface: '#111A30',
        'surface-2': '#0D1528',
        line: '#24344F',
        'line-soft': '#1B2740',
        brand: {
          DEFAULT: '#2DD4BF',
          dark: '#14B8A6',
          soft: 'rgba(45,212,191,0.14)',
        },
        accent: {
          DEFAULT: '#FFB020',
          dark: '#D97706',
          soft: 'rgba(255,176,32,0.14)',
        },
        ink: {
          DEFAULT: '#E9F0FA',
          muted: '#9AA9C4',
          faint: '#64748F',
        },
        status: {
          ok: '#34D399',
          danger: '#F87171',
          warning: '#FBBF24',
          info: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
