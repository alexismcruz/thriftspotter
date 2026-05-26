import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf4f0",
          100: "#fae5d8",
          500: "#e8703a",
          600: "#d4581f",
          700: "#b04518",
        },
      },
    },
  },
  plugins: [],
};

export default config;
