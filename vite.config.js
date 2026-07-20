import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bgp-deck-builder/', // GitHub Pages repo name — change if different
})
