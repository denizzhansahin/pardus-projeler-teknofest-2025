module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0052CC',
        'primary-dark': '#003E99',
        'primary-light': '#D1E0FF',
        secondary: '#FFAB00',
        'secondary-dark': '#CC8400',
        accent: '#4CAF50',
        'accent-dark': '#388E3C',
        neutral: {
          50: '#FAFBFC',
          100: '#F1F2F4',
          200: '#E5E7EB',
          300: '#D2D6DC',
          400: '#9FA6B2',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
