import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://aditano.github.io/tesla-model3-simulator/
export default defineConfig({
  plugins: [react()],
  base: "/tesla-model3-simulator/",
});
