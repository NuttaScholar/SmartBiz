import { useContext } from "react";
import { StorefrontSessionContext } from "./storefrontSessionContext";

export function useStorefrontSession() {
  const context = useContext(StorefrontSessionContext);
  if (!context) {
    throw new Error(
      "useStorefrontSession must be used inside StorefrontSessionProvider",
    );
  }

  return context;
}
