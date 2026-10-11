# 05 — REST API Contract

Machine-readable contract: `api/openapi.yaml` (OpenAPI 3.1). All routes are prefixed `/api/v1`; JSON request/response bodies use camelCase. Times are ISO-8601 UTC timestamps; dates such as `serviceDate` are `YYYY-MM-DD` in the shop's configured time zone (`Asia/Kolkata`).

## Standard response and errors

Success responses use the schema appropriate to the route. Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please review the highlighted fields.",
    "requestId": "req_...",
    "details": [{ "field": "cardNumber", "issue": "Invalid format" }]
  }
}
```

Never return stack traces, SQL text, credentials or unmasked personal data.

## Endpoints

### System and public information

- `GET /health` — process liveness.
- `GET /ready` — database/readiness check (do not leak connection info).
- `GET /public/config` — enabled locales, prototype disclaimer, service status and feature switches.
- `GET /public/notices` — published notices; filter by `locale` and `limit`.
- `GET /public/districts` — demo districts represented in the seed set.
- `GET /public/commodities` — commodity catalogue, display names and units.
- `GET /public/policies/current` — configured rules with `isDemo`, `sourceUrl`, `verifiedAt` and effective period.
- `GET /public/shops` — query parameters `q`, `district`, `taluk`, `pincode`, `page`, `pageSize`.
- `GET /public/shops/{shopId}` — one shop's public profile.
- `GET /public/shops/{shopId}/availability` — demo stock snapshot and queue summary with data timestamp.

### Demo citizen workflow

- `POST /citizen/demo-card-verifications` — verifies a pre-seeded fictional card; only enabled when `DEMO_MODE=true`; returns a short-lived verification session. Do not accept real card records.
- `GET /citizen/demo-card-verifications/{verificationId}/entitlements` — configured entitlements for the verified synthetic card.
- `POST /queue-tokens` — create token for a valid verification session; require `Idempotency-Key`; prevent duplicate active token.
- `GET /queue-tokens/{tokenId}` — citizen-safe queue status, position and approximate wait.
- `POST /queue-tokens/{tokenId}/cancel` — cancel only while WAITING; reason is optional for beneficiary and required for staff cancellation.
- `POST /complaints` — create demo complaint; returns a public reference code; rate-limited.
- `GET /complaints/{referenceCode}` — status only; avoid revealing complaint details without the associated verification/session secret.
- `POST /assistant/query` — local FAQ first; optional LLM provider; returns `answer`, `locale`, `sourceLinks`, `isAiGenerated`, `fallbackUsed`.

### Staff and supervisor

- `POST /auth/login` — staff/admin login.
- `POST /auth/logout` — invalidate the session.
- `GET /auth/me` — actor role and assigned shop, without secrets.
- `GET /staff/queue` — assigned-shop queue; filter `status`, `serviceDate`, `counterNo`.
- `POST /staff/queue/call-next` — body `{ "counterNo": 1 }`; atomic FIFO dispatch.
- `POST /staff/queue-tokens/{tokenId}/no-show` — mark no-show with required reason.
- `POST /staff/queue-tokens/{tokenId}/cancel` — operator/supervisor cancel with required reason.
- `POST /staff/queue-tokens/{tokenId}/complete` — actual distributed line items; idempotent and transactional.
- `GET /staff/inventory` — current inventory for assigned shop.
- `POST /staff/inventory/transactions` — restock/adjustment with commodity, signed quantity, reason and idempotency key; restrict adjustment permissions.
- `GET /staff/inventory/ledger` — paginated stock ledger.
- `GET /staff/beneficiaries` — search synthetic test records only; redact fields by default.
- `GET /staff/reports/summary` — queue/stock KPIs for a date range, marked as demo metrics.

### Administrator

- `GET|POST /admin/shops`, `GET|PATCH|DELETE /admin/shops/{shopId}` — shop management (soft-disable preferred to delete if referenced by transactions).
- `GET|POST /admin/users`, `PATCH /admin/users/{userId}` — manage roles/active status/shop assignments; never return password hashes.
- `GET|POST /admin/commodities`, `PATCH /admin/commodities/{commodityId}`.
- `GET|POST /admin/policy-rules`, `PATCH /admin/policy-rules/{ruleId}` — versioned entitlements with dates and source metadata.
- `GET|POST /admin/notices`, `PATCH /admin/notices/{noticeId}`.
- `GET /admin/complaints`, `PATCH /admin/complaints/{complaintId}` — triage/status changes.
- `GET /admin/audit-logs` — filterable, read-only audit stream.

## Status and concurrency semantics

- `WAITING → SERVING → COMPLETED` is the normal path.
- `WAITING → CANCELLED` or `WAITING → NO_SHOW` is allowed.
- `SERVING → CANCELLED` only by supervisor with mandatory reason and an explicit no-deduction reconciliation path.
- Completed tokens cannot be cancelled or completed again.
- Invalid transition returns `409 CONFLICT`.
- Stock shortage returns `409 INSUFFICIENT_STOCK`; entire distribution transaction rolls back.
- `401` means unauthenticated; `403` means authenticated but not authorized; `404` hides resources that user cannot access.
- `429` for rate limits; `422` for valid JSON with business-rule failure; `400` for schema validation; `500` generic unexpected error.

## API implementation checklist

- Share request/response schemas in `packages/contracts` or API Zod schemas.
- Validate params, query, headers and body; reject unknown fields for write routes where appropriate.
- Add `requestId` to every response and structured logs.
- Put authorization checks on every staff/admin route; verify shop scope in service layer.
- Add pagination limits (default 20, max 100).
- Use transactions, database constraints and idempotency keys for state-changing operations.
- Add integration tests from `09_ACCEPTANCE_TESTS.md` before claiming endpoints complete.
