import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tempo } from 'tempo-devtools/dist/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Completely disable fast refresh to avoid react-refresh issues
      fastRefresh: false,
    }),
    tempo(), // Add the tempo plugin
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-refresh': path.resolve(__dirname, './node_modules/react-refresh'),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === 'true' ? true : undefined,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
