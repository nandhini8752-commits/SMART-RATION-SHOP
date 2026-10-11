# 09 — Acceptance Test Plan

## Test layers

- Unit: FIFO ordering, allowed token transitions, entitlement rule version selection, estimated wait calculation, stock delta validation.
- API integration: authentication, authorization, validation, database constraints, concurrency and rollback.
- UI component: accessible labels, error state, locale switch, status badges, keyboard interaction.
- End-to-end: a complete citizen → staff → inventory workflow.
- Security regression: cross-shop access denied, role escalation denied, secrets/PII not exposed.

## Required acceptance cases

| ID | Scenario | Expected result |
|---|---|---|
| AC-01 | Search shops with district and text filters | Only matching demo shops returned; pagination stable |
| AC-02 | Unknown card submitted for demo verification | 404/422-style safe response; no verification session or token |
| AC-03 | Known synthetic card verified | Demo-only entitlement view returned with policy version/source metadata |
| AC-04 | Create token with idempotency key | One WAITING token returned |
| AC-05 | Retry same create request/key | Same token returned; no duplicate row |
| AC-06 | Create second active token for same card/shop/date | Conflict response; active token linked |
| AC-07 | Create several tokens then call next | Strict sequence/FIFO order preserved |
| AC-08 | Two concurrent call-next actions at same counter | Exactly one token becomes SERVING on that counter |
| AC-09 | Call-next on a busy counter | Safe conflict; current SERVING token unchanged |
| AC-10 | Cancel WAITING token | Token CANCELLED; remaining positions update |
| AC-11 | Cancel completed token | Conflict; distribution and inventory unchanged |
| AC-12 | Mark no-show | Token is NO_SHOW; actor and reason audited |
| AC-13 | Complete service with sufficient stock | Distribution, stock ledger and token status commit together |
| AC-14 | Complete same token twice | Second request returns existing result or conflict; no extra deductions |
| AC-15 | Complete when one commodity is short | Whole transaction rolls back; no partial deductions |
| AC-16 | Stock adjustment without reason | Validation failure; no inventory change |
| AC-17 | Stock adjustment with reason | Inventory and immutable ledger update in same transaction |
| AC-18 | Staff attempts access to another shop | 403 or privacy-preserving 404; no data leakage |
| AC-19 | Operator attempts admin-only policy change | 403; audit security event |
| AC-20 | Refresh queue tracker | Status/position rehydrates from API and stays current |
| AC-21 | Notification provider unavailable | Core queue mutation succeeds; failed delivery logged for retry |
| AC-22 | Switch to Tamil on each route | No missing key, overlap, clipping or English-only validation errors for acceptance locale |
| AC-23 | Mobile at 360px / browser zoom 200% | No page-level horizontal overflow; critical actions available |
| AC-24 | Assistant provider not configured | Local FAQ works; graceful disclosure; no crash |
| AC-25 | Search audit logs as operator | Denied if outside permitted scope; admin results redact sensitive data |
| AC-26 | Public pages opened without login | Public sample info works; private records remain unavailable |
| AC-27 | Demo mode disabled | Demo card verification endpoint refuses to operate |
| AC-28 | User attempts to submit Aadhaar-like value | No Aadhaar field exists; do not retain unexpected identifiers in logs |

## Required E2E walkthrough

1. Open home and verify the prototype disclaimer is visible.
2. Switch to Tamil and confirm main navigation, forms and validation text change.
3. Find a seeded demo shop and open details.
4. Verify a seeded fictional ration card.
5. Review demo entitlement rules and source indicator.
6. Create a token and observe the confirmation, position and approximate wait.
7. Open a second browser context as the seeded staff user assigned to that exact shop.
8. Call the token at a free counter and confirm the citizen view changes.
9. Enter the actual quantities distributed and complete the token.
10. Confirm stock changed once, ledger contains one distribution event and token is completed.
11. Retry completion and confirm no second deduction.
12. Open admin audit view and confirm attributable events are recorded.

## Release gates

- No TypeScript errors or lint errors.
- Unit and API test suite passes.
- E2E walkthrough passes from a clean demo seed.
- No known critical/high security issue in the prototype threat checklist.
- No dead primary buttons, placeholder links in core journeys or false “live” claims.
- Build can be installed/run from README without API keys for AI/notifications.
