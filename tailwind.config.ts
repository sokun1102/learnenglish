import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7f3ea",
        line: "#d9d1c2",
        moss: "#507365",
        coral: "#d85f45",
        gold: "#c5922f"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 42, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
