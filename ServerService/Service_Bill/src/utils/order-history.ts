import { errorCode_e } from "./enum";

export type HistoryCursor = { createdAt: Date; orderID: string };

export function parseHistoryQuery(limitInput?: unknown, cursorInput?: unknown) {
  const invalid = () => { throw { code: errorCode_e.InvalidInputError, message: "Invalid history limit or cursor" }; };
  const limit = limitInput === undefined ? 20 : Number(limitInput);
  if ((limitInput !== undefined && typeof limitInput !== "string" && typeof limitInput !== "number")
    || !Number.isInteger(limit) || limit < 1 || limit > 100) invalid();
  let cursor: HistoryCursor | undefined;
  if (cursorInput !== undefined) {
    if (typeof cursorInput !== "string" || cursorInput.length > 2048) invalid();
    try {
      const value = JSON.parse(decodeURIComponent(cursorInput as string));
      if (typeof value.createdAt !== "string" || typeof value.orderID !== "string"
        || !value.orderID || value.orderID.length > 200) invalid();
      const createdAt = new Date(value.createdAt);
      if (!Number.isFinite(createdAt.getTime())) invalid();
      cursor = { createdAt, orderID: value.orderID };
    } catch { invalid(); }
  }
  return { limit, cursor };
}

export function encodeHistoryCursor(order: HistoryCursor) {
  return encodeURIComponent(JSON.stringify({ createdAt: order.createdAt.toISOString(), orderID: order.orderID }));
}
