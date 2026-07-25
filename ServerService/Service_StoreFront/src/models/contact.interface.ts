import type { Document } from "mongoose";

export interface ContactDocument extends Document {
  codeName: string;
  billName: string;
  address?: string;
  tel?: string;
  taxID?: string;
  description?: string;
}
