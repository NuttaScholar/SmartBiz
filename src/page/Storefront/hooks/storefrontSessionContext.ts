import { createContext } from "react";
import type { CustomerSession } from "../type";

export type StorefrontSessionState = {
  customerToken: string;
  session?: CustomerSession;
  isLoading: boolean;
  error: string;
};

export const StorefrontSessionContext =
  createContext<StorefrontSessionState | undefined>(undefined);
