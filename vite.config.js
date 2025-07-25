// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ทำให้เข้าถึงได้จากภายนอก (ถ้าต้องการ)
    port: 5173, // พอร์ต Frontend
    fs: {
      cachedChecks: false, // ปิดการ cache การตรวจสอบไฟล์
    },
  },
  // *** เพิ่มส่วนนี้ ***
  define: {
    // Vite จะแทนที่ process.env.VITE_API_BASE_URL ด้วยค่าจาก Environment Variable ของ Netlify
    // หรือถ้าไม่มีใน Netlify จะใช้ค่าจากไฟล์ .env.production หรือ .env ใน local
    // หรือถ้าไม่มีเลย จะเป็น 'undefined' (แต่เราจะจัดการให้มั่นใจว่ามีค่า)
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
  // ******************
  build: {
    // กำหนด base path สำหรับ asset paths
    // ถ้า deploy ไปที่ root ของ domain ก็ใช้ '/'
    // ถ้า deploy ไปที่ subpath เช่น example.com/my-app/ ก็ต้องใส่ '/my-app/'
    // สำหรับ Netlify ทั่วไป มักจะเป็น '/'
    base: '/',
    rollupOptions: {
      output: {
        // เพื่อให้ asset paths ถูกต้องใน Production
        // entryFileNames: `assets/[name]-[hash].js`,
        // chunkFileNames: `assets/[name]-[hash].js`,
        // assetFileNames: `assets/[name]-[hash].[ext]`
      },
    },
  },
});