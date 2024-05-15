import type { Config } from "tailwindcss"

const config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }

      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... }
      xs: { max: "200px" },
    },
    extend: {
      fontFamily: {
      },
      colors: {
        bg: "#1f1f1f",
        text: "#cccccc",
        outline: "#30302b",
        shadow: "#606055",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config