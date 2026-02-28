/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#FF8205",
          hover: "#FA500F",
          soft: "rgba(255, 130, 5, 0.08)",
          border: "rgba(255, 130, 5, 0.25)",
        },
        sidebar: {
          DEFAULT: "#1E1E1E",
          hover: "#2C2C2E",
          border: "rgba(255,255,255,0.06)",
          text: "#8A8A8E",
          "text-active": "#FFFFFF",
        },
        content: {
          bg: "#FFFAEB",
          card: "#FFFFFF",
          border: "#E9E2CB",
          "border-strong": "#D5CCAC",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#6B6B6B",
          muted: "#9A9A9A",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "Helvetica", "sans-serif"],
        mono: ["Courier New", "Courier", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        lg: "0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)",
        orange: "0 4px 14px rgba(255,130,5,0.25)",
      },
    },
  },
  plugins: [],
};
