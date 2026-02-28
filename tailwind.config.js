/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand Colors ─────────────────────────────────────
      colors: {
        // Main colours
        mint: {
          DEFAULT: "#46BEAA",
          50: "#A0DCD2",
          10: "#EDF8F6",
          dark: "#277777", // Sure Sage used as mint-dark
        },
        pepper: "#000000",
        coconut: "#FFFFFF",

        // Secondary colours
        sage: {
          DEFAULT: "#277777",
          50: "#91B9B9",
        },
        blueberry: {
          DEFAULT: "#41B4D2",
          50: "#A0D7E6",
        },
        rhubarb: {
          DEFAULT: "#F08791",
          50: "#F5C3C8",
        },
        lemon: {
          DEFAULT: "#FFEB78",
          50: "#FFF5B9",
        },
        fig: {
          DEFAULT: "#005A8C",
          50: "#7DAAC3",
        },
        grape: {
          DEFAULT: "#7850B4",
          50: "#B9A5D7",
        },
        orange: {
          DEFAULT: "#E15A46",
          50: "#F0AAA0",
        },

        // UI neutrals
        surface: "#FFFFFF",
        "surface-2": "#F0F0EE",
        border: "#E2E2DF",
        "border-strong": "#C8C8C4",
        "text-secondary": "#3D3D3D",
        "text-muted": "#8A8A87",
      },

      // ── Typography ────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
      fontWeight: {
        black: "900",
      },
      letterSpacing: {
        tight: "-0.02em",
        snug: "-0.01em",
      },

      // ── Border Radius ─────────────────────────────────────
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },

      // ── Shadows ───────────────────────────────────────────
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.06)",
        md: "0 4px 16px rgba(0,0,0,0.08)",
        lg: "0 12px 40px rgba(0,0,0,0.10)",
        xl: "0 24px 60px rgba(0,0,0,0.12)",
      },

      // ── Background Gradients ──────────────────────────────
      backgroundImage: {
        "grad-mint-sage": "linear-gradient(135deg, #46BEAA, #277777)",
        "grad-mint-lemon": "linear-gradient(135deg, #46BEAA, #FFEB78)",
        "grad-rhubarb-lemon": "linear-gradient(135deg, #F08791, #FFEB78)",
        "grad-blueberry-mint": "linear-gradient(135deg, #41B4D2, #46BEAA)",
        "grad-rhubarb-fig": "linear-gradient(135deg, #F08791, #005A8C)",
        "grad-fig-blueberry": "linear-gradient(135deg, #005A8C, #41B4D2)",
        "grad-grape-rhubarb": "linear-gradient(135deg, #7850B4, #F08791)",
        "grad-orange-lemon": "linear-gradient(135deg, #E15A46, #FFEB78)",
      },
    },
  },
  plugins: [],
};
