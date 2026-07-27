import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import type { ServerResponse } from 'node:http'
import { resolve } from 'node:path'
//import fs from 'fs'

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
    host: true
  },
  preview: {
    port: 3030,
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
