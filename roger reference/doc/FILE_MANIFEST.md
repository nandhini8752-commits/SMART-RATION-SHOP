# File Manifest

## Main planning documents
- `01_PRODUCT_SCOPE.md` — functionality, roles, boundaries, success definition
- `02_DESIGN_SYSTEM.md` — government-style visual language, colors, typography, accessibility
- `03_PAGE_MAP.md` — route-by-route frontend page specification
- `04_ARCHITECTURE.md` — frontend/backend/data architecture and transactional invariants
- `05_API_CONTRACT.md` — API routes and semantics
- `06_DATA_MODEL.md` — entities and data integrity rules
- `07_SECURITY_AND_PRIVACY.md` — privacy/security guardrails
- `08_LOCALIZATION.md` — English/Tamil + Telugu/Hindi localization plan
- `09_ACCEPTANCE_TESTS.md` — testable acceptance scenarios
- `10_ASSETS_AND_REFERENCES.md` — logo sources, license notes and official links

## Implementation inputs
- `api/openapi.yaml` — machine-readable API contract
- `api/README.md` — API examples and inspection instructions
- `database/schema.sql` — PostgreSQL reference schema
- `database/seed.demo.sql` — fictional shops/cards/commodities/stock/counters only
- `.env.example` — safe environment variable template
- `assets/logos/srqms-mark.svg` — original non-government project mark
- `scripts/fetch_reference_assets.sh` — optional online download helper; not automatic

## Antigravity prompts
- `prompts/00_MASTER_PROMPT.md` — overall constraints and workflow
- `prompts/01_foundation.md` — base app, API, database, demo data
- `prompts/02_citizen.md` — citizen-facing service flows
- `prompts/03_staff_queue_inventory.md` — staff console and transactional distribution
- `prompts/04_admin.md` — administration, policy, notices and audit
- `prompts/05_integrations_localization.md` — AI/notifications/locale completion
- `prompts/06_qa_release.md` — accessibility, QA and handover

## Handover documents
- `context/PROJECT_REPORT.md` — original report supplied for this task, unchanged
- `docs/DEMO_SCRIPT.md` — validation demonstration script
- `docs/KNOWN_LIMITATIONS.md` — non-production scope and limitations
- `docs/ASSET_CREDITS.md` — asset attribution and usage notes
- `docs/IMPLEMENTATION_CHECKLIST.md` — unchecked requirement tracking list
