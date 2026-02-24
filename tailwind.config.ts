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
        primary: "#0F2A44",
        secondary: "#1DB954",
        accent: "#F4C430",
        background: "#F5F7FA",
        card: "#FFFFFF",
        "text-primary": "#1E1E1E",
        "text-secondary": "#6B7280",
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      fontWeight: {
        heading: "600",
        "heading-bold": "700",
        body: "400",
        "body-medium": "500",
        button: "600",
      },
    },
  },
  plugins: [],
};

export default config;
