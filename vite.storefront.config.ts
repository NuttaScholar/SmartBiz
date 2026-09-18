import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import { resolve } from 'node:path'
//import fs from 'fs'

const apiProxy = {
  '/api': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
}

function useStorefrontAsHomePage(
  req: Connect.IncomingMessage,
  _res: Connect.ServerResponse,
  next: Connect.NextFunction,
) {
  const pathname = req.url?.split('?')[0]
  if (
    pathname === '/' ||
    pathname === '/index.html' ||
    pathname === '/storefront' ||
    pathname?.startsWith('/storefront/')
  ) {
    req.url = '/apps/storefront/index.html'
  }
  next()
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'storefront-home-page',
      configureServer(server) {
        server.middlewares.use(useStorefrontAsHomePage)
      },
      configurePreviewServer(server) {
        server.middlewares.use(useStorefrontAsHomePage)
      },
    },
  ],
  server: {
    /*https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    },*/
    port: 4030,
    host: true,
    proxy: apiProxy,
  },
  preview: {
    port: 4030,
    proxy: apiProxy,
  },
  build: {
    rollupOptions: {
      input: {
        storefront: resolve(__dirname, 'apps/storefront/index.html'),
      },
    },
  },
})
