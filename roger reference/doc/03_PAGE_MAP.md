# 03 — Page Map & Route Inventory

## Public / citizen routes

| Route | Page | Key behaviour |
|---|---|---|
| `/` | Home | Prototype banner, service tiles, current notices, official-resource links |
| `/shops` | Find a ration shop | Filter/search/paginate demo shops |
| `/shops/:shopId` | Shop details | Address, timings, contacts where seeded, demo-stock snapshot, queue status |
| `/ration-services` | Ration services guide | Informational links to official TNPDS / department services; no fake official operations |
| `/card/verify` | Verify demo ration card | Synthetic card lookup and clear demo-only note |
| `/card/entitlements` | Demo entitlement details | Only after verified demo session; policy source/effective date visible |
| `/queue/create` | Generate token | Active-token duplicate prevention; confirmation summary |
| `/queue/:tokenId` | Track token | Live status, position, approximate wait, cancel if WAITING |
| `/complaints/new` | Demo complaint | Validated category/message; no Aadhaar or sensitive documents |
| `/complaints/:reference` | Complaint tracking | Demo-only status lookup |
| `/notices` | Notices | Published and archived notices |
| `/help` | Help and FAQ | Local FAQ assistant and official help contacts/links |
| `/accessibility` | Accessibility | Site accessibility options and contact |
| `/privacy` | Privacy | Data used by this prototype, retention and demo limitations |

## Authentication routes

| Route | Page | Key behaviour |
|---|---|---|
| `/staff/login` | Staff login | Demo credentials in local setup docs; do not expose staff credentials publicly in deployed builds |
| `/admin/login` | Admin login | Separate role guard; seeded local demo account only |
| `/forbidden` | Access denied | Explain insufficient permission; link back |

## Shop operator routes (`/staff/*`)

| Route | Page | Key behaviour |
|---|---|---|
| `/staff/dashboard` | Shop overview | Waiting, serving, completed today, low-stock indicators |
| `/staff/queue` | Live queue | FIFO order, counter assignments, call-next, no-show, cancel, complete |
| `/staff/queue/:tokenId` | Token detail | Masked card identity, expected entitlements, actual dispense form, history |
| `/staff/inventory` | Inventory | Live sample quantity and low-stock indicators |
| `/staff/inventory/ledger` | Stock ledger | Filtered read-only ledger with actor, quantity before/after and reason |
| `/staff/beneficiaries` | Demo beneficiary lookup | Search fake card number/name; mask sensitive fields |
| `/staff/reports` | Shop reports | Date filters, queue metrics, stock movements, CSV export only for demo data |
| `/staff/settings` | Shop settings | Only editable fields permitted to operator; no cross-shop switching |

## Administrator routes (`/admin/*`)

- `/admin/dashboard` — system totals clearly labelled demo.
- `/admin/shops` and `/admin/shops/:id` — shop lifecycle and service hours.
- `/admin/staff` — demo user accounts, roles and shop assignment.
- `/admin/commodities` — commodity catalogue and units.
- `/admin/policies` — versioned policy/entitlement rules, source URL and effective dates.
- `/admin/inventory` — authorized corrections and restock review.
- `/admin/notices` — publish/archive multilingual notices.
- `/admin/complaints` — view/update demo complaint statuses.
- `/admin/audit` — searchable append-only event audit.
- `/admin/settings` — locale/defaults, queue interval, notification providers and demo-mode banner; secrets are not shown.

## Navigation expectations

- On mobile, staff actions remain reachable without horizontal scrolling.
- Direct loading of nested routes must work after deployment (configure SPA fallback).
- A 404 page must exist.
- Only authenticated, authorized routes should mount their data queries.
- Every list page needs loading, empty, error, retry and pagination/filter states.
