import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"], // Adjust to include only necessary directories
  theme: {
    extend: {
      colors: {
        primary: '#00a181',
        secondary: '#10B981',
        'bg-primary': '#141414',
        'bg-secondary': '#0f0f0f',
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
