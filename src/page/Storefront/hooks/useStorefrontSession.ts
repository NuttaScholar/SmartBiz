import React from 'react';
import { useParams } from 'react-router-dom';
import type { CustomerSession } from '../type';

export function useStorefrontSession() {
  const { customerToken = "" } = useParams<{ customerToken: string }>();
  const [session, setSession] = React.useState<CustomerSession>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    window.setTimeout(() => {
      if (!active) return;
      if (!customerToken || customerToken === "invalid") {
        setSession(undefined);
        setError("ลิงก์ลูกค้าไม่ถูกต้องหรือหมดอายุ");
      } else {
        setSession({
          customerID: "CUST-001",
          customerName: "คุณลูกค้า SmartBiz",
          token: customerToken,
        });
      }
      setIsLoading(false);
    }, 250);

    return () => {
      active = false;
    };
  }, [customerToken]);

  return { customerToken, session, isLoading, error };
}
