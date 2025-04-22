// vite.config.ts (at project root)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
      // <-- point Vite at your frontend folder
  server: { port: 5173 },// <-- keeps the same port
  plugins: [react()],
  build: {
    outDir: "../dist",   // optional: place built files beside your backend
  },
});
