# Phase 5 — FAQ Assistant, Notifications and Full Localization

Complete English and Tamil first; wire Telugu/Hindi as subsequent locales per `08_LOCALIZATION.md`.

- Move all UI strings and validation messages to locale resources. No hardcoded strings in pages/components.
- Verify Tamil line-wrap, forms, tables, dialogs and alerts at 360px, 768px and desktop widths.
- Implement local FAQ lookup with curated answer IDs and source links. Include official portal links for actual official service operations. The assistant must not make binding eligibility or entitlement determinations.
- Add a provider adapter for Gemini (optional) with strict timeout, safe fallback, rate limit and output-size control. Never leak API keys to the frontend.
- Add a notification adapter interface. Mock/local provider is default. Telegram is enabled only when server config explicitly enables it, uses a test destination allowlist, and avoids sending card numbers.
- Notification failure cannot undo queue or inventory changes. Store attempt metadata and retry safely.
- Keep demo notice and sample-data labels localized on every route.

Run locale completeness tests and provider-disabled/provider-failure tests. Clearly report any intentionally unfinished locale rather than pretending all translations are complete.
