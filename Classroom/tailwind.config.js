/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7451EB',
        secondary: '#F5F5F5',
        accent: '#FFD15C',
      },
    },
  },
  plugins: [],
}