import react from '@vitejs/plugin-react'
import jsonDbPlugin from './server/jsonDbPlugin.js'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsonDbPlugin()],
})
