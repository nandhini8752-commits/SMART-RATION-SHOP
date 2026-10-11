# SRQMS — Tamil Nadu Smart Ration Queue Management System
### தமிழ்நாடு பொது விநியோகத் திட்ட நியாயவிலைக் கடை வரிசை மேலாண்மை தளம்
**Civil Supplies and Consumer Protection Department, Government of Tamil Nadu**  
*Validation Prototype for PDS Queue Modernization, Digital Tokens, and Stock Governance*

---

> **PROTOTYPE NOTICE / மாதிரி அறிவிப்பு**  
> This portal is an independent validation prototype developed for functional testing, usability research, and operational demonstration of smart queuing in Tamil Nadu Fair Price Shops. All citizen records (`DEMO-TN-0001` to `DEMO-TN-0005`), transactions, and accounts are synthetic demo data.

---

## 1. Executive Summary & Capabilities

SRQMS provides an end-to-end, government-grade queuing and inventory operations platform tailored to Tamil Nadu's Universal Public Distribution System:

1. **Dual-Language First-Class UX**: Seamless English and Tamil (தமிழ்) toggle with culturally grounded terminology (e.g., குடும்ப அட்டை, வரிசை டோக்கன், பங்கீட்டுப் பொருட்கள், நியாயவிலைக் கடை).
2. **Deterministic FIFO Queue Engine**: Multi-counter dispatch with strict sequence ordering, customer wait-time estimations, and per-day duplicate token protections.
3. **Citizen Services**:
   - Fair price shop discovery with district, taluk, and locality filters.
   - Live synthetic smart card verification.
   - Dynamic policy rule evaluation by card category (`PHH`, `AAY`, `NPHH`).
   - Digital queue token receipt generation with live 4-second polling and cancellation.
   - Multi-channel notification timeline (SMS Gateway & Telegram alerts).
   - Citizen grievance submission and real-time status tracking.
   - Automated multilingual AI/rule assistant.
4. **Operator & Supervisor Portal**:
   - Multi-counter dispatch console (`call-next`, `no-show`, `cancel`).
   - Commodity entitlement dispensation with atomic inventory deductions.
   - Live stock balances and automated reorder alerts.
   - Immutable double-entry stock transactions ledger.
   - Masked beneficiary search and shop KPI dashboards.
5. **Department Administrator Governance**:
   - Cross-shop operational overview and active counter KPIs.
   - Shop registration and geocoding controls.
   - Staff user provisioning and active status toggling.
   - Central commodity catalogue management.
   - Versioned entitlement policy engine with gazetted citation auditing.
   - Bilingual department circular publishing.
   - Citizen grievance triage workflow (`RECEIVED` → `IN_REVIEW` → `RESOLVED`).
   - Searchable, immutable audit stream of all operator and administrative actions.

---

## 2. Technology Stack & Architecture

- **Frontend**: React 19, TypeScript, React Router 7, Vite 8, Lucide React icons.
- **Styling**: Tailwind CSS with Tamil Nadu Government Design Tokens:
  - Primary Maroon: `#7B2638` (contrast ratio 8.6:1 against white; WCAG AAA compliant)
  - Temple Gold: `#C49A3A`
  - Forest Green: `#1F6B45`
  - Cream Paper Canvas: `#FAF8F4`
  - Typography: Noto Sans Tamil & system sans-serif hierarchy.
- **Backend**: Express, Node.js (v20+), Native ESM.
- **Database**: Embedded PostgreSQL WASM ([PGlite](https://pglite.dev/)) / PostgreSQL with relational integrity, foreign key cascading, and ACID transactions.
- **Security**: JWT session tokens with role-based access control (`SHOP_OPERATOR`, `SHOP_SUPERVISOR`, `SYSTEM_ADMIN`), bcrypt password hashing, and PII masking.
- **Testing**: Vitest automated test runner executing 52 sequential integration test cases across 7 comprehensive test suites.

---

## 3. Demonstration Accounts & Synthetic Beneficiaries

### Staff & Administrative Credentials

| Role | Username | Password | Assigned Scope |
| :--- | :--- | :--- | :--- |
| **Shop Operator** | `operator_anna` | `DemoOperator@123` | Fair Price Shop 001 (Anna Nagar East, Chennai) |
| **Shop Supervisor** | `supervisor_anna` | `DemoSupervisor@123` | Fair Price Shop 001 (Anna Nagar East, Chennai) |
| **System Administrator** | `admin_tn` | `DemoAdmin@123` | State-wide / All Shops & Policies |

### Synthetic Ration Cards (for Citizen Verification)

| Card Number | Category | Head of Family | Family Members | Assigned Shop |
| :--- | :--- | :--- | :--- | :--- |
| `DEMO-TN-0001` | **PHH** (Priority) | R. Selvam | 4 members | Fair Price Shop 001 (Chennai) |
| `DEMO-TN-0002` | **AAY** (Antyodaya) | M. Meenakshi | 5 members | Fair Price Shop 001 (Chennai) |
| `DEMO-TN-0003` | **NPHH** (Non-Priority) | K. Vijayakumar | 3 members | Fair Price Shop 001 (Chennai) |
| `DEMO-TN-0004` | **NPHH-S** (Sugar Only) | S. Anuradha | 2 members | Fair Price Shop 002 (Mogappair) |
| `DEMO-TN-0005` | **AAY** (Antyodaya) | P. Subramanian | 6 members | Fair Price Shop 002 (Mogappair) |

---

## 4. API Endpoints Reference

### Public Endpoints (`/api/v1/public/*`)
- `GET /api/v1/public/config` — Portal metadata, version, and helpline directory.
- `GET /api/v1/public/shops` — Shop finder with search query, district, taluk, and pagination.
- `GET /api/v1/public/shops/:shopId` — Profile, locality, and opening hours for a shop.
- `GET /api/v1/public/shops/:shopId/availability` — Real-time queue count and stock availability.
- `GET /api/v1/public/commodities` — Canonical list of commodities (Rice, Sugar, Wheat, Dal, Oil).
- `GET /api/v1/public/policies/current` — Current gazetted entitlement scales.
- `GET /api/v1/public/notices` — Published department circulars.

### Citizen Endpoints (`/api/v1/citizen/*` & `/api/v1/queue-tokens`)
- `POST /api/v1/citizen/demo-card-verifications` — Validates synthetic card and returns scope.
- `GET /api/v1/citizen/cards/:cardNumber/entitlements` — Computes commodity quota & tariff.
- `POST /api/v1/queue-tokens` — Atomically creates FIFO token with duplicate protection.
- `GET /api/v1/queue-tokens/:tokenId` — Live position, customers ahead, and estimated wait.
- `POST /api/v1/queue-tokens/:tokenId/cancel` — Citizen self-cancellation.
- `GET /api/v1/citizen/queue/:tokenId/notifications` — SMS & Telegram dispatch timeline.
- `POST /api/v1/citizen/complaints` — Submits grievance and issues reference code.
- `GET /api/v1/citizen/complaints/:referenceCode` — Status lookup for filed complaint.
- `POST /api/v1/citizen/assistant/query` — AI/Rule-based PDS bilingual Q&A.

### Operator & Supervisor Endpoints (`/api/v1/staff/*`)
- `POST /api/v1/auth/login` — Staff authentication and JWT issuance.
- `GET /api/v1/staff/dashboard` — Live shop KPI overview (waiting, served, stock levels).
- `GET /api/v1/staff/queue` — Multi-counter queue lists (`SERVING`, `WAITING`, `HISTORY`).
- `POST /api/v1/staff/queue/call-next` — Atomic FIFO dispatch of next waiting token.
- `POST /api/v1/staff/queue/tokens/:id/complete` — Mark token completed.
- `POST /api/v1/staff/queue/tokens/:id/no-show` — Mark token as no-show with reason.
- `POST /api/v1/staff/queue/tokens/:id/cancel` — Operator cancellation with reason.
- `GET /api/v1/staff/beneficiaries` — Search assigned ration cards with masked PII.
- `GET /api/v1/staff/inventory` — Live stock balances and reorder warnings.
- `POST /api/v1/staff/inventory/transactions` — Record stock adjustments (`RESTOCK`, `ADJUSTMENT`).
- `GET /api/v1/staff/inventory/ledger` — Immutable stock transaction movement log.
- `POST /api/v1/staff/inventory/distribute` — Atomic commodity dispensation for active token.

### Administrator Endpoints (`/api/v1/admin/*`)
- `GET /api/v1/admin/summary` — State-wide dashboard counters and operational KPIs.
- `GET /api/v1/admin/shops` | `POST /api/v1/admin/shops` — Shop register.
- `GET /api/v1/admin/users` | `POST /api/v1/admin/users` — Staff RBAC management.
- `PATCH /api/v1/admin/users/:id/status` — Activate/deactivate operator accounts.
- `GET /api/v1/admin/commodities` | `POST /api/v1/admin/commodities` — Commodity catalogue.
- `GET /api/v1/admin/policies` | `POST /api/v1/admin/policies` — Versioned policy engine.
- `GET /api/v1/admin/notices` | `POST /api/v1/admin/notices` — Circular publishing.
- `GET /api/v1/admin/complaints` | `PATCH /api/v1/admin/complaints/:id` — Grievance triage.
- `GET /api/v1/admin/audit-logs` — Immutable audit log stream.

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js version 20 or higher.
- npm version 9 or higher.

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run database migration (creates schema and tables in ./data/pgdata)
npm run db:migrate

# 3. Seed demo shops, commodities, policies, cards, and staff accounts
npm run db:seed

# 4. Run automated test suite (52 tests across 7 test files)
npm test

# 5. Start development server
npm run dev

# 6. Verify production build
npm run build
```

---

## 6. Accessibility & Compliance Verification

- **WCAG 2.2 Level AA**: Meets minimum 4.5:1 text-to-background contrast on all interfaces; primary brand maroon (`#7B2638`) achieves 8.6:1 contrast.
- **Keyboard Traversal**: Skip-to-content links (`#main-content`), logical tab order, and persistent focus outlines.
- **Tamil Typography**: Custom line-height and font metric allowances preventing diacritic and glyph clipping in Noto Sans Tamil.
- **Auditability**: Every write operation (queue transition, stock delta, user toggle, grievance triage) produces an immutable record in `audit_logs`.
