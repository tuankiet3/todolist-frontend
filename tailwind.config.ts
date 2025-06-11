import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class", // Quan trọng!
  theme: { extend: {} },
  plugins: [],
};
export default config;
