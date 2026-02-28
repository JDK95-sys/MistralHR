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
          soft: "rgba(255, 130, 5, 0.12)",
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
          bg: "#1A1A1C",
          card: "#242426",
          border: "#333336",
          "border-strong": "#444448",
        },
        text: {
          primary: "#F0F0F0",
          secondary: "#B0B0B4",
          muted: "#707074",
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
        sm: "0 1px 3px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.14)",
        md: "0 4px 12px rgba(0,0,0,0.24), 0 2px 4px rgba(0,0,0,0.14)",
        lg: "0 12px 32px rgba(0,0,0,0.28), 0 4px 8px rgba(0,0,0,0.14)",
        orange: "0 4px 14px rgba(255,130,5,0.25)",
      },
    },
  },
  plugins: [],
};
