import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "http://localhost:8000";

  return {
    server: {
      host: "localhost",
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: apiTarget.startsWith("https://"),
        },
        "/uploads": {
          target: apiTarget,
          changeOrigin: true,
          secure: apiTarget.startsWith("https://"),
        },
      },
    },

    plugins: [react(), componentTagger()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
