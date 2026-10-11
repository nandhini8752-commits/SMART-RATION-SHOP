# 08 — Localization & Tamil-First Quality

## Locale plan

- Acceptance gate 1: English (`en`) and Tamil (`ta`) complete end to end.
- Follow the original report's target of Telugu (`te`) and Hindi (`hi`) as additional locales; incomplete strings must fall back clearly to English rather than rendering blank keys.
- Keep all visible text in translation dictionaries: navigation, titles, form labels, validations, API errors, statuses, queue announcements, notification templates, empty states, dialogs, table headers, dates and units.
- API responses should return stable machine codes and values; client translates display text. Don't have the server return UI-specific English strings except generic diagnostics.

## Suggested layout

```text
apps/web/src/i18n/
  index.ts
  locales/en.json
  locales/ta.json
  locales/te.json
  locales/hi.json
```

Use locale keys such as `queue.status.waiting`, `queue.action.callNext`, `inventory.stockAvailable`, `common.prototypeNotice`. Never key statuses by their translated label.

## Tamil acceptance rules

- Use UTF-8; load a legible Tamil font (Noto Sans Tamil or OS fallback).
- Test every page in Tamil at mobile width and 200% browser zoom.
- Don't place translated text in fixed-height boxes; allow wrapping.
- Keep form hints and errors near their fields; ensure labels don't overlap icons.
- Date/time and number formatting must be locale-aware; retain the configured shop time zone.
- Respect logical start/end alignment for RTL-ready future expansion, even though Tamil is LTR.
- Never transliterate official policy details if a verified Tamil wording exists; cite the authoritative link.

## Policy-language integrity

Changing UI language does not translate or change an entitlement rule. Store the rule numerically with stable commodity/card codes, and store optional localized explanation separately. If only English/Tamil source text is verified, mark Telugu/Hindi explanation as translated informational text, not a government-issued translation.
