import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        fog: "#d9e4f2",
        accent: "#7ef0c7",
        ember: "#ff7c5c",
        steel: "#183048",
      },
      boxShadow: {
        panel: "0 20px 80px rgba(1, 13, 27, 0.35)",
      },
      backgroundImage: {
        "mesh-radial":
          "radial-gradient(circle at top left, rgba(126,240,199,0.24), transparent 28%), radial-gradient(circle at top right, rgba(255,124,92,0.18), transparent 24%), linear-gradient(180deg, #081220 0%, #040a14 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
