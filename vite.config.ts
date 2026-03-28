import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/MatlabGraderProblemGenerator/',
  plugins: [react()],
  server: {
    port: 3002,
  },
});
