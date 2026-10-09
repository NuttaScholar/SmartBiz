import { build, loadEnv } from 'vite';

// Read .env.home (including ${HOME_HOST} interpolation) without changing VPS settings.
const env = loadEnv('home', process.cwd(), '');
if (!env.HOME_HOST || !env.VITE_WEB_SHOP || !env.VITE_API_GATEWAY_URL) {
  throw new Error('Create .env.home and set HOME_HOST before building.');
}
await build({ mode: 'home', build: { outDir: 'dist-home' } });
