import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

 

  return {
    server: {
      host: "::",
      port: 8080,

      proxy: {
        '/api': {
          target: 'http://localhost:5000', // 👈 your backend server URL
          changeOrigin: true,
          
        }
      }
      
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
