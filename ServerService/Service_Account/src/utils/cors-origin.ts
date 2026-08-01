export function parseAllowedOrigins(value: string): string[] {
  const origins = value.split(",").map((item) => item.trim()).filter(Boolean).map((item) => {
    const url = new URL(item);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`Invalid CORS origin protocol: ${item}`);
    }
    return url.origin;
  });
  if (origins.length === 0) throw new Error("At least one CORS origin is required");
  return [...new Set(origins)];
}
