/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#1a1a1a",
          cream: "#faf8f5",
          accent: "#b8860b",
          gray: "#6b6b6b",
          lightgray: "#e8e8e8",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Montserrat", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.2em",
        widest3: "0.3em",
      },
      keyframes: {
        menuSlideDown: {
          "0%": { opacity: 0, transform: "translateY(-8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        bounce2: {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(6px)" },
        },
      },
      animation: {
        menuSlideDown: "menuSlideDown 0.25s ease forwards",
        bounce2: "bounce2 2s infinite",
      },
    },
  },
  plugins: [],
};