import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 新增这一行

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})