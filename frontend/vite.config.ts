import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // loadEnv also picks up VITE_* vars set in the host's environment (e.g. Vercel dashboard).
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiUrl = env.VITE_API_URL?.trim() ?? ''

  if (command === 'build' && mode === 'production') {
    if (!apiUrl) {
      throw new Error(
        '[pulse] VITE_API_URL is not set. Set it to your backend origin ' +
          '(e.g. https://pulse-api.onrender.com) in the Vercel project settings before building.',
      )
    }
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(apiUrl)) {
      console.warn(`\n[pulse] Warning: production build is pointing at ${apiUrl}. This only works locally.\n`)
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        // In dev, if VITE_API_URL is empty, requests to /api are forwarded to the Node backend.
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})