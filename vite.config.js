import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Tách vendor thành các chunk riêng để browser cache lâu dài,
    // trang load lần đầu chỉ tải những gì cần thiết
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|react-router-dom)[\\/]/ },
            { name: 'vendor-mui', test: /node_modules[\\/](@mui|@emotion)[\\/]/ },
            { name: 'vendor-anim', test: /node_modules[\\/](framer-motion|gsap)[\\/]/ },
            { name: 'vendor-form', test: /node_modules[\\/](react-hook-form|zod)[\\/]/ },
            { name: 'vendor-misc', test: /node_modules[\\/](zustand|sonner|swiper)[\\/]/ },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
