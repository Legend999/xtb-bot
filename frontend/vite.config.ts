import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { getValidPortNumber } from '../shared/utils/port.ts';

dotenv.config({path: path.resolve(import.meta.dirname, '../.env')});

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: getValidPortNumber(process.env.FE_PORT),
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/graphql': `http://localhost:${getValidPortNumber(process.env.BE_PORT).toString()}`,
      '/subscriptions': `ws://localhost:${getValidPortNumber(process.env.BE_PORT).toString()}`,
    },
  },
});
