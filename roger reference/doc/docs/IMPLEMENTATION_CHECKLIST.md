# Requirement-to-Implementation Checklist

The checklist is intentionally unchecked: Antigravity must check an item only after code and relevant tests exist.

## Foundations
- [ ] Inspect existing repository and preserve working code
- [ ] Local setup from fresh checkout
- [ ] PostgreSQL migrations and demo seed guarded by DEMO_MODE
- [ ] Standard errors/request IDs/structured logs
- [ ] Session auth, password hashing, RBAC and shop scope
- [ ] Prototype banner on all routes

## Citizen
- [ ] Home / notices / help / official links
- [ ] Shop search/filter/detail
- [ ] Demo card verification
- [ ] Versioned entitlement view with provenance labels
- [ ] Idempotent token creation
- [ ] Live queue tracker and cancellation
- [ ] Demo complaint create/status
- [ ] Local FAQ works without AI credentials

## Staff operations
- [ ] Assigned-shop dashboard
- [ ] FIFO queue and counters
- [ ] Safe concurrent call-next
- [ ] No-show/cancel with reasons and audit
- [ ] Atomic one-time distribution completion
- [ ] Stock shortage rollback
- [ ] Inventory restock/adjustment and append-only ledger
- [ ] Masked demo beneficiary search
- [ ] Date-range demo reports

## Administrator
- [ ] Shop management
- [ ] Staff/users/roles
- [ ] Commodity catalogue
- [ ] Policy versioning, effective dates and provenance
- [ ] Notices lifecycle/localized content
- [ ] Complaint triage
- [ ] Audit viewer
- [ ] Cross-shop inventory and authorized stock correction

## Quality
- [ ] English + Tamil complete
- [ ] Telugu + Hindi implemented or transparently documented as incomplete
- [ ] Keyboard/accessibility/contrast/zoom tests
- [ ] Mobile Tamil layout at 360px
- [ ] Unit/API/E2E acceptance tests pass
- [ ] Secrets absent from client bundles/logs
- [ ] Provider-offline behavior works
- [ ] Build/deploy/backup/reset/limitations documented
