/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Ensures Tailwind works in all your React files
    "./public/index.html", // Include HTML files if needed
  ],
  theme: {
    extend: {}, // Customize your theme here
  },
  plugins: [], // Add plugins if needed
};