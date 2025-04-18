/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Ensures Tailwind works in all your React files
    './public/index.html', // Include HTML files if needed
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F85C5C',
        accent1: '#FFB347', // Orange
        accent2: '#82D173', // Green
        accent3: '#5DA9E9', // Blue
        accent4: '#AC8FE9', // Purple
      },
      fontFamily: {
        handwritten: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [], // Add plugins if needed
  // Safelist the dynamic classes used for sidebar active states
  safelist: [
    'bg-primary', 'text-primary',
    'bg-accent1', 'text-accent1',
    'bg-accent2', 'text-accent2',
    'bg-accent3', 'text-accent3',
    'bg-accent4', 'text-accent4',
  ],
};
