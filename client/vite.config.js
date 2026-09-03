import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',  // Ensures all asset paths resolve from root in production (Vercel)
  server: { 
    host: '0.0.0.0', // Listen on all network interfaces (IPv4 + IPv6)
    port: 3000,
    strictPort: true,
    open: false
  },
})
