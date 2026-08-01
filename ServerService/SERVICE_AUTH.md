# Service-to-Service Authentication

All backend services except `Service_Login` accept short-lived service JWTs
in the existing `Authorization: Bearer <token>` header.

`SERVICE_AUTH_SECRET` must be shared by the participating services, contain
at least 32 characters, and differ from the user JWT `SECRET`.

## Token contract

```json
{
  "type": "serviceToken",
  "service": "service_storefront",
  "sub": "service:service_storefront",
  "iss": "service_storefront",
  "aud": "service_bill",
  "scopes": ["bill.storefront.manage"],
  "jti": "unique-token-id",
  "iat": 1785211200,
  "exp": 1785211320
}
```

The middleware requires an `HS256` signature, a trusted service name,
matching `iss`/`sub`, the target service's `aud`, string scopes, `jti`,
`iat`, and `exp`. Token lifetime must not exceed five minutes. Tokens
created by the bundled token utilities in every participating service
expire after two minutes.

Service tokens do not contain a user `role`. Each endpoint accepts either
its existing user role or the endpoint-specific service scope.

## Current outbound calls

| Caller | Audience | Scopes |
| --- | --- | --- |
| `service_storefront` | `service_bill` | `bill.storefront.manage`, `bill.storefront.read` |
| `service_stock` | `service_bill` | `bill.product-usage.read` |
| `service_stock` | `service_account` | `account.transaction.create` |
| `service_bill` | `service_account` | `account.transaction.create` |

An inbound service token must never be forwarded to another audience.
The calling service creates a new token for every downstream service.
