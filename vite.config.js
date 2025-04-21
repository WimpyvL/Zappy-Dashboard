import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tempo } from 'tempo-devtools/dist/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tempo(), // Add the tempo plugin
  ],
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === 'true' ? true : undefined,
    host: '0.0.0.0',
    port: 3000,
  },
  define: {
    'process.env.REACT_APP_TEMPO': JSON.stringify(process.env.TEMPO || 'false'),
  },
});
