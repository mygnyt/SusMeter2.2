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
        background: "#0e131b",
        card: "#161c28",
        "card-hover": "#1a2232",
        "card-border": "rgba(255, 255, 255, 0.07)",
        "zone-green": "#2dd4bf",
        "zone-yellow": "#fbbf24",
        "zone-red": "#f87171",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
