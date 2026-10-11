# Phase 3 — Staff Console, FIFO Queue and Transactional Inventory

Build staff login, role-based route guards, assigned-shop dashboard, live queue, counter state, token details, stock, stock ledger, beneficiary demo lookup and reports.

Critical server-side requirements:
- Password verification against hashes; never return secrets.
- Verify staff role and assigned shop for every route. An operator must not access a second shop by changing a URL or request body.
- `call-next` must take a counter number and atomically serve the earliest WAITING token; concurrent calls cannot double-serve a token, and an already busy counter must return 409.
- No-show/cancel must validate status transition and record actor/reason.
- Completion body specifies actual distributed commodity line items. In one database transaction, lock token and inventory, validate quantities, insert distribution transaction/items, insert stock-ledger rows, update stock and mark token completed. Duplicate completion must not deduct twice.
- If any commodity is short or any item fails validation, roll back all distribution and inventory changes.
- Restock/adjustment requires reason, actor and idempotency handling. Ledger rows are append-only in application logic.
- Queue statuses and button labels are localized; destructive actions need confirmation.
- Reports are demo metrics; no unsupported “hours saved” or real-world impact claims.

Write automated integration tests for FIFO, duplicate completion, insufficient inventory rollback, busy counter, concurrent call-next, shop scoping and ledger auditability.
