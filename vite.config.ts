import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // for react
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from "@tanstack/devtools-vite";


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devtools({
      injectSource: {
        enabled: true,
      },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 3000,
    open: true,
  },

})
