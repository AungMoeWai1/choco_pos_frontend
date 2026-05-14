import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3D1A00',
          50: '#FDF6EE',
          100: '#F5E6D3',
          200: '#E8C9A0',
          300: '#D4A574',
          400: '#C8860A',
          500: '#3D1A00',
          600: '#2D1200',
          700: '#1E0C00',
          800: '#0F0600',
          900: '#050300',
        },
        secondary: '#C8860A',
        accent: '#F5A623',
        background: '#FDF6EE',
        surface: '#FFFFFF',
        'text-primary': '#1A0A00',
        'text-secondary': '#6B4A2A',
        success: '#2D7A4F',
        danger: '#C0392B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(61, 26, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(61, 26, 0, 0.14)',
      },
    },
  },
  plugins: [],
}

export default config
