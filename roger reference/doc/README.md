# SRQMS — Antigravity Implementation Pack

**Project:** Smart Ration Queue Management System (validation prototype)  
**Jurisdiction / reference context:** Tamil Nadu, India  
**Purpose:** Build a polished, working demonstration of ration-shop discovery, sample-card entitlement checks, token queues, staff workflows, inventory, complaints, notices, and multilingual citizen help.

> **Prototype disclosure:** This is not an official Government of Tamil Nadu or TNPDS service. Do not imply government endorsement, connect to real beneficiary systems, collect Aadhaar/real ration-card data, or display fabricated live government data. Use the prototype banner and synthetic demo records throughout validation.

## Start here

1. Read `context/PROJECT_REPORT.md` — the original project report is retained unchanged as the feature baseline.
2. Read `01_PRODUCT_SCOPE.md`, `02_DESIGN_SYSTEM.md`, `03_PAGE_MAP.md`, `04_ARCHITECTURE.md`, `05_API_CONTRACT.md`, `06_DATA_MODEL.md`, `07_SECURITY_AND_PRIVACY.md`, `08_LOCALIZATION.md`, `09_ACCEPTANCE_TESTS.md`, `10_ASSETS_AND_REFERENCES.md`.
3. Import `api/openapi.yaml` into Swagger Editor or Swagger UI for the machine-readable endpoint contract.
4. Review `database/schema.sql` and `database/seed.demo.sql`. The seed file contains fictional test records only.
5. Paste `prompts/00_MASTER_PROMPT.md` into Antigravity, then proceed phase-by-phase with prompts `01` to `06`.

## Recommended implementation baseline

- Frontend: React + TypeScript + Vite + Tailwind CSS; React Router; TanStack Query; React Hook Form + Zod; Lucide icons.
- Backend: Node.js LTS + Express + TypeScript; Zod request validation; OpenAPI contract; structured logging.
- Database: PostgreSQL. Use Prisma or Drizzle, but don't use two ORMs in the same project. If Antigravity chooses Prisma, map the SQL design in `database/schema.sql` into Prisma models and migrations.
- API: JSON REST endpoints under `/api/v1`.
- Testing: Vitest + React Testing Library for UI/domain tests; Supertest for API; Playwright for critical end-to-end flows.
- Live queue UX: polling every 3–5 seconds for the prototype; isolate a future Server-Sent Events/WebSocket adapter behind the same queue service.
- Notifications: provider adapter interface with mock provider by default; Telegram optional only when configured server-side.

## Environment setup

Copy `.env.example` to `.env`. Do not commit `.env`. A basic local build should run without Gemini or Telegram keys by using local FAQ answers and mock notifications.

## Official reference links

- TNPDS citizen portal: https://www.tnpds.gov.in/home.xhtml
- Civil Supplies & Consumer Protection Department: https://www.consumer.tn.gov.in/
- Department fair-price-shop information: https://www.consumer.tn.gov.in/fairprice.htm
- Tamil Nadu Civil Supplies Corporation PDS page: https://tncsc.tn.gov.in/en/PDS.html
- Chennai District public distribution services: https://chennai.nic.in/service/public-distribution-system-services/
- NFSA Tamil Nadu overview: https://nfsa.gov.in/State/TN

Use those sources to verify labels, official service links, help contacts, shop/commodity terminology and policy before any public launch. The existing portal's functions may differ from the prototype. Don't scrape private/authenticated pages or present unsupported integrations as real.

## Asset status

- `assets/logos/srqms-mark.svg` is a locally authored, non-government project mark.
- `assets/logos/tamil-nadu-emblem-commons.png` could not be fetched into this runtime. `10_ASSETS_AND_REFERENCES.md` contains its verified source page and direct URL, attribution, and license. Use `scripts/fetch_reference_assets.sh` on a machine with network access to fetch optional reference assets after reviewing license and usage appropriateness; do not substitute a fake/generated state emblem.

## Build sequence

Foundation → citizen services → staff operations → admin/audit → integrations/localization → QA and deployment documentation. Do not implement every page as a static mock. Each visible control must have a working route/action or be explicitly disabled with an explanation.

## Key separate files

- Design direction: `02_DESIGN_SYSTEM.md`
- Page inventory: `03_PAGE_MAP.md`
- Architecture: `04_ARCHITECTURE.md`
- API contract: `api/openapi.yaml` and `05_API_CONTRACT.md`
- SQL schema and demo seed: `database/schema.sql`, `database/seed.demo.sql`
- Antigravity master + phase prompts: `prompts/`
- Assets and official references: `10_ASSETS_AND_REFERENCES.md`
