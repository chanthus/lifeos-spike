module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [
    require('nativewind/preset'),
    require('@project/config/tailwind/preset'),
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-animate')],
  important: 'html',
};
