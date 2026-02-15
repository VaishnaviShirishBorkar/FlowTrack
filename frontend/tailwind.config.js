/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0E14",
        card: "#111827",
        border: "#1F2937",
        primary: "#3B82F6",
        success: "#22C55E",
        danger: "#EF4444",
        text: "#E5E7EB",
      },
    },
  },
  plugins: [],
};
