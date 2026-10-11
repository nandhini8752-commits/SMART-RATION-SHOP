# Phase 4 — Administrator, Policy, Notices and Audit

Implement system-admin pages and APIs for demo shops, users, commodities, versioned entitlement rules, notices, complaint status and audit logs.

Requirements:
- Admin-only routes must be protected at API and service layers.
- Prefer soft-disable for shops/users that have transaction history; do not delete referenced records.
- Validate effective-from/effective-to dates and prevent overlapping active policy versions for the same rule scope unless an explicit priority model exists.
- Store source URL, source note, verified-at date and an `isDemo` flag on policies. If policy source is unverified, label the UI “Demo policy — illustrative only.”
- Commodity names should be localized data; rules should use stable commodity/category codes.
- Notices support drafts, publishing windows, archive, Tamil/English content, and preview.
- Audit view is read-only with filtering/pagination. Mask sensitive data. Log actor, action, resource, request ID and safe before/after values.
- Exports should include only allowed synthetic data, state the selected date range and add a demo label.

Test role failures, policy date validation, notice publication windows, soft-disable behaviour and audit record creation.
