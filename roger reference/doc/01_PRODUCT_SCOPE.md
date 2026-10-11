# 01 — Product Scope & Validation Goals

## 1. Product definition

SRQMS is a validation prototype for improving the beneficiary experience at Tamil Nadu Fair Price Shops (FPS). It demonstrates how beneficiaries could inspect shop information, verify a **synthetic demo card**, join a FIFO queue and track a token, while staff manage queue service and a demo inventory ledger.

The product is not a replacement for TNPDS, the official electronic Point of Sale (ePoS), government beneficiary systems, or authorized grievance channels. All records and transactions must be visibly marked as demo data.

## 2. User roles

1. **Public visitor** — sees public notices, demo shop directory, operating-hour information, policy/help pages and language controls.
2. **Demo beneficiary** — verifies a synthetic card, checks configured demo entitlements, creates/cancels a token and tracks progress.
3. **Shop operator** — sees only the assigned demo shop; calls the next FIFO token, marks no-show/cancelled/completed and records commodity quantities dispensed.
4. **Shop supervisor** — manages shop stock, delivery/restock events and shop-level reports.
5. **System administrator** — manages demo shops, users, notices, policies, commodities, stock corrections, and audit reports.

Enforce role and shop scoping on the server, not just by hiding UI elements.

## 3. Functional requirements

### Citizen-facing
- English/Tamil switch with Tamil as a first-class layout, not just translated labels.
- Optional Telugu/Hindi UI resources as set out in the original report; English and Tamil are the first acceptance target.
- Home page with prototype notice, service shortcuts, notices and help contacts verified from official sources.
- Shop finder filterable by district, taluk, locality and shop code; detail view includes address, opening hours, status and demo stock snapshot.
- Synthetic ration-card verification; only pre-seeded fake card numbers work in demo mode.
- Entitlement view from versioned, admin-managed demo policy rules. Explain whether quantities are “demo values” or “verified policy”; never infer a live official entitlement from generic NFSA rules.
- One active WAITING/SERVING token per demo card and shop/service date. Token receipt includes token ID, position, estimated wait (label approximate), shop, service date and cancellation action.
- Queue tracking auto-refreshes. Status values: WAITING, CALLED/SERVING, COMPLETED, CANCELLED, NO_SHOW.
- Complaint/contact form using synthetic details only; reference number, status and demo acknowledgement.
- AI/help panel backed by local vetted FAQs first. LLM fallback only if configured; responses must say to consult the official portal/helpline for consequential issues.

### Operator
- Login as a seeded demo user using credentials in local setup docs; production-style password hashing even for demo accounts.
- Multi-counter display with the next valid FIFO token. Never allow two simultaneous staff actions to serve the same token.
- Idempotent completion operation to prevent duplicate deductions.
- Record the actual quantity per commodity dispensed. Reject quantity greater than available stock and quantities inconsistent with configured entitlement unless a supervisor-authorized override is explicitly recorded.
- No-show and cancel actions require confirmation and log the actor/reason.
- View beneficiary demo records with masking; don't show full phone numbers, Aadhaar numbers, or real identifiers.

### Supervisor / administrator
- CRUD for demo shops, staff accounts, commodities, shop inventory and notices.
- Configure entitlement rules with an effective-from/effective-to range and evidence URL/source note.
- Restock/adjust inventory with reason required; every change writes an append-only stock ledger row and an audit event.
- Reports: queue throughput, average service time, no-show count, commodity totals, stock movement and error/notification logs. Distinguish demo metrics from measured real-world outcomes.

### Operational quality
- Responsive layout from 360px mobile width to desktop.
- Keyboard accessibility, visible focus, labels, useful empty states and errors.
- Loading/error/offline states on each data-driven page.
- Every primary button works. No inert prototype controls that look enabled.
- Seed/reset command for repeatable demos and test data.

## 4. Out of scope for validation

- Direct connection to TNPDS/RCMS/ePoS, Aadhaar, UIDAI, government SSO or a government database.
- Real ration-card verification, live stock feeds, real grievance submission, real SMS delivery or real beneficiary notifications.
- Payments, allocation decisions or binding entitlement determinations.
- Public production deployment under a government identity or domain without approval.

## 5. Definition of validation success

A reviewer can independently complete: (1) find a sample shop, (2) verify a demo card, (3) create a queue token, (4) monitor its position, (5) sign in as the correct shop operator, (6) call and complete the token, (7) observe inventory and audit-ledger changes, and (8) view the transaction history. These workflows must persist after refresh and be covered by automated tests.
