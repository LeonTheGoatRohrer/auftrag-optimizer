import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10212b",
        mist: "#eef4f3",
        action: "#0e7c66",
        warn: "#b3541e",
      },
    },
  },
  plugins: [],
};

export default config;
