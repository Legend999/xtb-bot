import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite';
import { getValidPortNumber } from './src/utils/port.ts';

dotenv.config({path: path.resolve(import.meta.dirname, '../.env')});

export default defineConfig({
  plugins: [react()],
  server: {
    port: getValidPortNumber(process.env.FE_PORT),
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/graphql': `http://localhost:${getValidPortNumber(process.env.BE_PORT).toString()}`,
    },
  },
});