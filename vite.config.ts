import { defineConfig } from 'vite';
import { vitePlugin as remix } from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import path from "path"

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  build: {
    minify: false,
    sourcemap: true,
  },
  logLevel: 'info',
});
