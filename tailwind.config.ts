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
        college: {
          DEFAULT: "#1d4ed8", // Vibrant blue
          light: "#dbeafe", // Light blue background
          dark: "#1e3a8a", // Dark blue text
          border: "#2563eb", // Border color
          bg: "#3b82f6", // Solid background
        },
        work: {
          DEFAULT: "#047857", // Vibrant green
          light: "#d1fae5", // Light green background
          dark: "#065f46", // Dark green text
          border: "#059669", // Border color
          bg: "#10b981", // Solid background
        },
        life: {
          DEFAULT: "#b45309", // Vibrant orange
          light: "#fed7aa", // Light orange background
          dark: "#92400e", // Dark orange text
          border: "#d97706", // Border color
          bg: "#f59e0b", // Solid background
        },
      },
    },
  },
  plugins: [],
};
export default config;

