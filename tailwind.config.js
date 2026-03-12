/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-space-grotesk)"],
        body: ["var(--font-source-sans-3)"]
      },
      boxShadow: {
        panel: "0 18px 40px -24px rgba(15, 23, 42, 0.5)"
      }
    }
  },
  plugins: []
};
