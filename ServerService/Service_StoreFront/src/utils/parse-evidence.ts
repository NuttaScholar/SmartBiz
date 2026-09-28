import AppError from "./app-error";

const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_EVIDENCE_TYPES = new Set([
  "application/pdf",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function parseEvidence(input: unknown) {
  const value = input as Record<string, unknown>;
  const fileName = requireText(value?.fileName, "fileName");
  const mimeType = requireText(value?.mimeType, "mimeType")
    .toLowerCase();
  const dataUrl = requireText(value?.dataUrl, "dataUrl");

  if (!ACCEPTED_EVIDENCE_TYPES.has(mimeType)) {
    throw new AppError("Evidence must be an image or PDF", 400);
  }

  const match = /^data:([^;,]+);base64,([a-z0-9+/=\s]+)$/i.exec(dataUrl);
  if (!match || match[1].toLowerCase() !== mimeType) {
    throw new AppError("dataUrl does not match mimeType", 400);
  }
  let data: Uint8Array;
  try {
    const binary = globalThis.atob(match[2].replace(/\s/g, ""));
    data = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new AppError("Evidence dataUrl is not valid base64", 400);
  }
  if (data.byteLength === 0 || data.byteLength > MAX_EVIDENCE_BYTES) {
    throw new AppError("Evidence must not exceed 2 MB", 413);
  }

  return { fileName, mimeType, data };
}

function requireText(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) throw new AppError(`${fieldName} is required`, 400);
  return value.trim();
}
