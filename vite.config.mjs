import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./client', import.meta.url));
const outDir = fileURLToPath(new URL('./dist', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root,
    plugins: [react()],
    build: { outDir, emptyOutDir: true },
    server: {
      host: '127.0.0.1',
      proxy: { '/api': `http://127.0.0.1:${env.PORT || 3000}` },
    },
  };
});
