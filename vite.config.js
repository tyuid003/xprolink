// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    fs: {
      cachedChecks: false,
    },
    // ** ตรวจสอบให้แน่ใจว่าไม่มี proxy สำหรับ '/go' หรือลบ block proxy ทั้งหมดออกไปก่อน **
    // proxy: {
    //   '/api': { // keep this if you still want to proxy /api
    //     target: 'http://localhost:5000',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // },
  },
});