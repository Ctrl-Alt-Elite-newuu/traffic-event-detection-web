import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In development the demo API (traffic-event-detection/demo) runs locally; override its
// address with DEMO_API=http://localhost:8001 if port 8000 is taken. In production Caddy
// serves the site and the API from the same origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': process.env.DEMO_API ?? 'http://localhost:8000' },
  },
})
