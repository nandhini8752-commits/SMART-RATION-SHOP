# 04 — Application Architecture

## Chosen baseline

Keep the React + TypeScript + Vite + Tailwind + Express + TypeScript direction in the supplied report. For multi-user queue and stock correctness, replace the report's file-backed JSON persistence with PostgreSQL for this validation build. Do not combine JSON and PostgreSQL as competing sources of truth.

## Proposed repository layout

```text
srqms/
  apps/
    web/                         # React + Vite + TypeScript
      src/
        app/                     # router, providers, route guards
        components/              # shared accessible UI
        features/
          citizen/ shops/ cards/ queue/ complaints/ help/
          staff/ inventory/ admin/ notices/ reports/
        i18n/                    # en, ta, te, hi resources
        lib/                     # api client, formatting, validators
        styles/
      public/                    # SRQMS project mark only by default
    api/                         # Express + TypeScript REST API
      src/
        config/                  # env validation
        middleware/              # auth, roles, validation, errors, request id
        routes/v1/
        services/                # business rules/transactions
        repositories/            # database access
        providers/               # notification and AI adapters
        jobs/                    # optional workers
        tests/
  packages/
    contracts/                  # shared DTOs and Zod schemas
  database/
    migrations/
    seed.demo.ts
  docs/
  docker-compose.yml
  .env.example
```

## Layer boundaries

- Frontend may format/display data; it must not decide entitlement, FIFO order, auth, stock arithmetic or role permissions.
- API routes validate input, authenticate, call a service, and return a standard response.
- Services implement transaction-level domain rules.
- Repositories persist entities; use transactions and uniqueness constraints.
- Providers wrap optional external systems (AI, Telegram). A provider outage must not break token creation or inventory updates.
- Policy service reads versioned policy rules with effective dates. Every entitlement response identifies its rule version/source and whether data is demonstration-only.

## Core invariants

1. A card may have only one active (`WAITING` or `SERVING`) token per shop and service date.
2. Token ordering is by service date and sequence number (FIFO), not client timestamp.
3. Only one token may transition to `SERVING` for a given counter at a time; concurrent “call next” requests must be serialized.
4. A token can complete only once. Completion and stock ledger writes happen in a single DB transaction.
5. `stock_after = stock_before + signed_quantity_delta`; quantities must not become negative.
6. Restock or adjustment always requires an authenticated role and a non-empty reason.
7. All status changes are audited with actor ID, timestamp, old value and new value.
8. API errors must not expose SQL, stack traces, secret values or unmasked PII.
9. Demo data stays isolated from any real-world external system.
10. External notifications are sent after the core state commits; failures are logged and retried without rolling back a completed queue transaction.

## Queue implementation

- The server issues a monotonically increasing per-shop/per-service-date sequence under a transaction/lock.
- `POST /queue-tokens` uses a client `Idempotency-Key`; duplicate submissions return the original token rather than a second one.
- `call-next` locks eligible WAITING token rows and counter state; order by `sequence_no ASC`; update token and counter atomically.
- Position endpoint counts eligible WAITING tokens ahead and returns `estimatedWaitMinutes` plus `estimateMethod: "demo_average_service_minutes"`.
- Prototype polling every 3–5 seconds is enough. Keep a QueueUpdateProvider interface so SSE/WebSocket can be added later without rewriting domain logic.

## Inventory/distribution transaction

`POST /staff/queue-tokens/{id}/complete` must accept actual line items. Inside one DB transaction: lock token, verify status SERVING and shop scope, validate each quantity, lock inventory rows, ensure no negative balance, create distribution + distribution items, decrement inventory, add stock ledger rows, mark token COMPLETED, write audit event. Enforce uniqueness on `distribution.token_id` and on stock-ledger source transaction/item to make retries idempotent.

## Authentication

Use secure server-side sessions or short-lived signed tokens. For a web app, same-site HTTP-only Secure cookies are preferred in production; rotate sessions after login; hash passwords with Argon2id or bcrypt; rate-limit login and verification endpoints; add CSRF protection if cookie-authenticated cross-site state changes are possible. Demo-only verification must be disabled or replaced before public deployment.

## External integrations

- Telegram: provider adapter; no secret in frontend; off by default. Only deliver to explicit opt-in test accounts in validation.
- AI: local FAQ first; external LLM fallback behind a server-side provider; sanitize inputs, add timeout, budget/rate limits and an explicit unavailability path.
- SMS/WhatsApp: not part of initial acceptance. Keep provider interfaces extensible, don't imply they are connected.

## Environment and deploy

`DATABASE_URL`, `SESSION_SECRET`, `APP_BASE_URL`, `NODE_ENV`, optional `GEMINI_API_KEY`, optional `TELEGRAM_BOT_TOKEN`. Validate environment at startup. Include health/readiness endpoints. Run migrations as deployment steps; seed demo data only in development/demo mode.
