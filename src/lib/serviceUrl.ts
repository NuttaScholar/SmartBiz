const webBackendUrl = new URL(import.meta.env.VITE_WEB_BACKEND);

export function serviceUrl(port: string | number): string {
  const url = new URL(webBackendUrl.origin);
  url.port = String(port);
  return url.origin;
}
