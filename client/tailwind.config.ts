import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        primary: {
          50: '#effcfb',
          100: '#d8f5f2',
          200: '#b9e7e1',
          300: '#82d8d0',
          400: '#46c4bb',
          500: '#0f9f9a',
          600: '#087f7c',
          700: '#086865',
          800: '#095452',
          900: '#0b4544',
        },
      },
    },
  },
  plugins: [typography],
};
export default config;
