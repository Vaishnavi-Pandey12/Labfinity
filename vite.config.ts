import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig({
  server: {
    host: "localhost",
    port: 5173,
    proxy: {
      "/api": {
        target: "https://labfinity.vercel.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },

  plugins: [react(), componentTagger()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});