import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import type { ServerResponse } from 'node:http'
import { resolve } from 'node:path'
//import fs from 'fs'

const apiProxy = {
  '/api/account': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/account/, ''),
  },
  '/api/login': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/login/, ''),
  },
  '/api/storage': {
    target: 'http://localhost:3002',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/storage/, ''),
  },
  '/api/stock': {
    target: 'http://localhost:3003',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/stock/, ''),
  },
  '/api/bill': {
    target: 'http://localhost:3004',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/bill/, ''),
  },
  '/api/storefront': {
    target: 'http://localhost:3005',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/storefront/, ''),
  },
}

function useStorefrontEntry(
  req: Connect.IncomingMessage,
  _res: ServerResponse,
  next: Connect.NextFunction,
) {
  const pathname = req.url?.split('?')[0]
  if (
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
      name: 'storefront-entry',
      configureServer(server) {
        server.middlewares.use(useStorefrontEntry)
      },
      configurePreviewServer(server) {
        server.middlewares.use(useStorefrontEntry)
      },
    },
  ],
  server: {
    /*https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    },*/
    port: 3030,
    host: true,
    proxy: apiProxy,
  },
  preview: {
    port: 3030,
    proxy: apiProxy,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        storefront: resolve(__dirname, 'apps/storefront/index.html'),
      },
    },
  },
})
