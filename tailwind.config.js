import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        purple: {
          "primary": "#9333ea",
          "secondary": "#7e22ce",
          "accent": "#c084fc",
          "neutral": "#2a1f35",
          "base-100": "#1d1729",
          "base-200": "#15101f",
          "base-300": "#0c0a13",
          "info": "#67e8f9",
          "success": "#34d399",
          "warning": "#fbbf24",
          "error": "#ef4444",
        },
        light: {
          "primary": "#570df8",
          "secondary": "#f000b8",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
          "base-200": "#f2f2f2",
          "base-300": "#e5e6e6",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        }
      }
    ],
  },
}