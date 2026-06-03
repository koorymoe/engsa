import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alamani: {
          navy: "#0B1929",
          "navy-light": "#132235",
          "navy-mid": "#1a2e45",
          "navy-dark": "#070f1a",
          gold: "#C9A84C",
          "gold-light": "#dbbf6a",
          "gold-dark": "#a8872e",
          "gold-pale": "#f5edd6",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      backgroundImage: {
        "alamani-gradient":
          "linear-gradient(135deg, #0B1929 0%, #132235 50%, #1a2e45 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #C9A84C 0%, #dbbf6a 50%, #a8872e 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(201, 168, 76, 0.3)",
        "gold-lg": "0 0 40px rgba(201, 168, 76, 0.4)",
        navy: "0 4px 20px rgba(11, 25, 41, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
