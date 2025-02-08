import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--md-sys-color-surface)",
        foreground: "var(--md-sys-color-on-surface)",
      },
      backgroundImage: {
        'grid': 'linear-gradient(45deg, #80808012 25%, transparent 25%), linear-gradient(-45deg, #80808012 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #80808012 75%), linear-gradient(-45deg, transparent 75%, #80808012 75%)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
      backgroundPosition: {
        'grid': '0 0, 0 10px, 10px -10px, -10px 0px',
      },
    },
  },
  plugins: [],
} satisfies Config;
