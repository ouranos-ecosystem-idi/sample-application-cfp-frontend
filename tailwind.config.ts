import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        ['dull-white']: '#FAFAFA',
        ['light-gray']: '#E9EAEB',
        gray: '#CCCCCC',
        ['dark-gray']: '#6D6D6D',
        ['default-text']: '#555555',
        ['done-gray']: '#AFAFAF',
        ['done-light-gray']: '#E7E7E7',
        ['link-blue']: '#051CB4',
        ['level-blue']: '#00588C',
        ['terminal-light-gray']: '#DFDFDF',
        ['direct-blue']: '#51B2D1',
        ['supplied-green']: '#7AD151',
      },
      keyframes: {
        'button-pop-slight': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.97)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },

      animation: {
        'button-pop-slight': 'button-pop-slight 0.1s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        default: {
          primary: '#0F7596',
          neutral: '#CCCCCC',
          info: '#92DEFF',
          success: '#36d399',
          warning: '#FFE500',
          error: '#F65E2D',
        },
      },
    ],
  },
};
export default config;
