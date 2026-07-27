import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  getStorefrontErrorMessage,
  listCustomerLinks,
  StorefrontApiError,
} from "../../API/StorefrontService/Storefront";
import type { CustomerLinkSummary } from "../../API/StorefrontService/Storefront";
import FieldSearch from "../../component/Molecules/FieldSearch";
import AppBar_c from "../../component/Organisms/AppBar_c";
import { useAuth } from "../../hooks/useAuth";
import { redirectToLogin } from "../../lib/authRedirect";
import CustomerCard from "./component/CustomerCard";
import SpeedDialCustomer from "./component/SpeedDialCustomer";
import { storefrontAdminWithRetry } from "./lib/storefrontAdminWithRetry";

export default function Page_Customer() {
  const authContext = useAuth();
  const navigate = useNavigate();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = React.useState<CustomerLinkSummary[]>([]);
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    storefrontAdminWithRetry(authContext, listCustomerLinks)
      .then((links) => {
        if (active) setCustomers(links);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (
          requestError instanceof StorefrontApiError
          && requestError.status === 401
        ) {
          redirectToLogin(navigate);
          return;
        }
        setError(getStorefrontErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authContext, navigate]);

  const filteredCustomers = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter(
      (customer) =>
        customer.customerID.toLowerCase().includes(keyword)
        || customer.customerName.toLowerCase().includes(keyword),
    );
  }, [customers, query]);

  function handleCustomerClick(
    edit: boolean,
    customer: CustomerLinkSummary,
  ) {
    const customerID = encodeURIComponent(customer.customerID);
    navigate(
      edit
        ? `/customer/create/${customerID}`
        : `/customer/${customerID}/discount`,
    );
  }

  return (
    <AppBar_c>
      <Container
        maxWidth="lg"
        sx={{
          width: "100%",
          py: 2,
          pb: 10,
        }}
      >
        <Stack spacing={2}>          

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <FieldSearch
              label="ค้นหาลูกค้า"
              placeholder="รหัสลูกค้า หรือ ชื่อลูกค้า"
              value={query}
              maxWidth="650px"
              onChange={(event) => setQuery(event.target.value)}
              onSubmit={setQuery}
            />
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box
            ref={listRef}
            sx={{
              height: "calc(100vh - 220px)",
              overflowY: "auto",
              pr: 0.5,
            }}
          >
            {isLoading ? (
              <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
                <CircularProgress />
                <Typography color="text.secondary">
                  กำลังโหลดรายชื่อลูกค้า
                </Typography>
              </Stack>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                {filteredCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.customerID}
                    value={customer}
                    variant="editable"
                    onClick={handleCustomerClick}
                  />
                ))}
              </Box>
            )}

            {!isLoading && !error && filteredCustomers.length === 0 && (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  {customers.length === 0
                    ? "ยังไม่มีลูกค้าที่ได้รับ Token"
                    : "ไม่พบลูกค้าที่ตรงกับคำค้นหา"}
                </Typography>
              </Paper>
            )}
          </Box>
        </Stack>
      </Container>

      <SpeedDialCustomer
        onGoToTop={() =>
          listRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
      />
    </AppBar_c>
  );
}
