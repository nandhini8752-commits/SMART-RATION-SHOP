# 06 — Data Model & Persistence

The reference SQL is `database/schema.sql`; fictional development fixtures are in `database/seed.demo.sql`. PostgreSQL is the source of truth. All quantities are `NUMERIC`, never floating-point values.

## Core entities

- `app_users`: staff/admin identity, hashed password, role, active state, optional assigned shop.
- `shops`: code, name, district/taluk/locality, address, pin code, service hours, contact display and active flag.
- `commodities`: stable code, names by locale, unit, active flag.
- `ration_cards`: synthetic cards only for this prototype; demo marker is mandatory.
- `policy_rules`: versioned card-category × commodity rule data, region conditions, effective dates, source URL/note, verification time and demo flag. Avoid encoding rules in UI or treating rules from generic NFSA sources as universal TN entitlements.
- `shop_inventory`: current quantity, reorder level and last update, unique per shop + commodity.
- `queue_counters`: counter availability/current serving token per shop and counter.
- `queue_tokens`: unique token number and sequence per shop/service date; card, status, counter and timestamps.
- `distribution_transactions` + `distribution_items`: actual quantities handed out. Token is unique to avoid duplicate completion.
- `stock_transactions`: append-only signed movement ledger with before/after quantities, reason, actor and source transaction.
- `complaints`: synthetic complaint record, public reference, category, status, minimal message and timestamps.
- `notices`: English/Tamil content, publication window and state.
- `notifications`: delivery attempt metadata only; redact destination and message bodies.
- `audit_logs`: actor, action, resource, old/new safe values, request ID, timestamp.
- `idempotency_keys`: key per actor/route, response reference and expiry for safe retries.

## Database rules

1. Unique `(shop_id, service_date, sequence_no)` and `(shop_id, service_date, token_number)`.
2. Partial unique index for one active token per ration card + shop + service date where status is `WAITING` or `SERVING`.
3. Inventory row updates and corresponding `stock_transactions` insert in a single transaction.
4. Distribution completion and all stock deductions commit atomically.
5. Prevent negative inventory with service checks plus `CHECK (quantity_available >= 0)`.
6. Immutable stock and audit ledgers. Corrections should be a new compensating event, not a rewrite of history.
7. Store only the minimum beneficiary data needed for the demo. No Aadhaar, biometric templates, real card dumps or OTP values.
8. Keep policy source and effective dates with each rule version; never silently overwrite historical rules.

## Migration and seed workflow

- `npm run db:migrate` applies schema changes.
- `npm run db:seed:demo` should fail unless `DEMO_MODE=true` and should only insert synthetic values.
- `npm run db:reset:demo` should be destructive only in local demo/test environments and require an explicit confirmation flag.
- Tests should use a separate test database/container and clean fixtures between suites.
