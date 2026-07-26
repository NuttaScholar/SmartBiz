import React from 'react';
import { useParams } from 'react-router-dom';
import {
  getStorefrontErrorMessage,
  getStorefrontSession,
} from '../../../API/StorefrontService/Storefront';
import type { CustomerSession } from '../type';
import { StorefrontSessionContext } from './storefrontSessionContext';

export function StorefrontSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customerToken = "" } = useParams<{ customerToken: string }>();
  const [session, setSession] = React.useState<CustomerSession>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    setSession(undefined);

    if (!customerToken) {
      setError("ลิงก์ลูกค้าไม่ถูกต้องหรือหมดอายุ");
      setIsLoading(false);
      return () => controller.abort();
    }

    getStorefrontSession(customerToken, controller.signal)
      .then((nextSession) => {
        setSession(nextSession);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(getStorefrontErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [customerToken]);

  const value = React.useMemo(
    () => ({ customerToken, session, isLoading, error }),
    [customerToken, session, isLoading, error],
  );

  return (
    <StorefrontSessionContext.Provider value={value}>
      {children}
    </StorefrontSessionContext.Provider>
  );
}
