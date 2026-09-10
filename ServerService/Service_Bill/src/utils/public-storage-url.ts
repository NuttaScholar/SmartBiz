// Keep browser URLs separate from the private Docker endpoint.
export function readPublicStorageUrl(value: string | undefined, fallback: string): string {
  if (process.env.NODE_ENV === "production" && !value) {
    throw new Error("MINIO_PUBLIC_URL is required in production");
  }
  const url = new URL(value || fallback);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("MINIO_PUBLIC_URL must be an HTTP(S) origin without a path or credentials");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("MINIO_PUBLIC_URL must use HTTPS in production");
  }
  return url.origin;
}
