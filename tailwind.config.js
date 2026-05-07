/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003857",
        "primary-mid": "#1b4f72",
        accent: "#fea520",
        "bg-page": "#f4f6f8",
        "bg-card": "#ffffff",
        "text-main": "#1a1c1e",
        "text-sub": "#41474e",
        "text-muted": "#72787f",
        "border-ghost": "#e5e8e8",
        error: "#ba1a1a",
      },
      boxShadow: {
        card: "0px 4px 12px rgba(26,28,30,0.05)",
        modal: "0px 12px 24px rgba(26,28,30,0.10)",
      },
      borderRadius: {
        base: "8px",
        large: "16px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

module.exports = config;
