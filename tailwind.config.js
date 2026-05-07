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
        primary: {
          DEFAULT: "#003857",
          light: "#004d77",
          dark: "#002337",
        },
        "primary-mid": "#1b4f72",
        accent: {
          DEFAULT: "#fea520",
          light: "#ffb84d",
          dark: "#e5941c",
        },
        "bg-page": "#f8fafc",
        "bg-card": "#ffffff",
        "text-main": "#0f172a",
        "text-sub": "#475569",
        "text-muted": "#94a3b8",
        "border-ghost": "#f1f5f9",
        "border-muted": "#e2e8f0",
        error: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
          dark: "#b91c1c",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
          dark: "#047857",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
          dark: "#b45309",
        },
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        card: "0px 2px 8px rgba(0, 0, 0, 0.04)",
        modal: "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
