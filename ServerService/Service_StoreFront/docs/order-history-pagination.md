# Order history pagination

`GET /storefront/:customerToken/orders?limit=20&cursor=...`

- Includes online and direct orders for the customer authenticated by the token.
- `limit` defaults to 20; valid values are integers from 1 to 100.
- Omit `cursor` for the first page. Pass the previous response's `nextCursor`
  unchanged as a query parameter for the next page (let the HTTP client encode it).
- Invalid pagination returns HTTP 400.
- Orders are sorted by `createdAt` descending, then `orderID` descending.

The response has changed from an array in `data` to a page object:

```json
{
  "success": true,
  "data": {
    "items": [],
    "hasMore": false,
    "nextCursor": null
  }
}
```

Append `items` to the current list and stop requesting when `hasMore` is false.
Reset the cursor when changing customer or refreshing. Newer orders added while
paging appear after a refresh; this is not a snapshot of the database.

The frontend currently uses a Load more button. A future intersection observer
can invoke the same loader for infinite scrolling. The loader prevents concurrent
requests, cancels on customer changes, and deduplicates appended order IDs.

StoreFront calls `GET /bill/storefront/history` with `customerID`, `limit`, and
`cursor` using the `bill.storefront.read` service scope. Deploy Service_Bill,
Service_StoreFront, and the frontend together. The Bill order schema includes a
compound index on `{ customerID: 1, createdAt: -1, orderID: -1 }` for this query.
