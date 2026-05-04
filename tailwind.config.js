/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#22C55E",
        "primary-dark": "#16A34A",
        secondary: "#3B82F6",
        accent: "#F59E0B",
        surface: "#F9FAFB",
      },
    },
  },
  plugins: [],
};
