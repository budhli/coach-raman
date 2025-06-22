import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({

  build: {
    rollupOptions: {
      external: ['i18next', 'react-i18next']
    }
  }
  plugins: [react()],
})