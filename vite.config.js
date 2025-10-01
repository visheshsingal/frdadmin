import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:4000')
  },
  server: {
    port: 5174 // Local dev port
  }
});

