import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './three-visualization/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg0: '#04070f',
        bg1: '#07121f',
        neon: '#2be4ff',
        danger: '#ff355e',
        success: '#38ff9c'
      },
      boxShadow: {
        neon: '0 0 30px rgba(43,228,255,0.25)',
        danger: '0 0 28px rgba(255,53,94,0.25)'
      }
    }
  },
  plugins: []
};

export default config;
