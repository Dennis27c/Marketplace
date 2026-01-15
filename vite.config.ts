import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173, // Puerto estándar de Vite
    host: '0.0.0.0', // Permite acceso desde la red local
    strictPort: false, // Si el puerto está ocupado, intenta otro
    cors: true, // Habilita CORS para acceso desde otros dispositivos
    // Configurar HMR para que funcione en red local
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173,
    },
    // Asegurar que los archivos se sirvan correctamente
    fs: {
      strict: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
