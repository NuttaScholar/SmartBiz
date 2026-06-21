import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import { resolve } from 'node:path'
//import fs from 'fs'

function useDemoAsHomePage(
  req: Connect.IncomingMessage,
  _res: Connect.ServerResponse,
  next: Connect.NextFunction,
) {
  if (req.url === '/' || req.url === '/index.html') {
    req.url = '/demo/index.html'
  }
  next()
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'demo-home-page',
      configureServer(server) {
        server.middlewares.use(useDemoAsHomePage)
      },
      configurePreviewServer(server) {
        server.middlewares.use(useDemoAsHomePage)
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
  },
  preview: {
    port: 4030,
  },
  build: {
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'demo/index.html'),
      },
    },
  },
})
