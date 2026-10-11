# 07 — Security, Privacy & Demo Boundaries

## Hard guardrails

- Always show a localized banner: “Validation prototype — not an official government website. Uses sample data.”
- Never imply affiliation, government endorsement, live TNPDS access or real beneficiary validation.
- Use fictional cards, names, shop IDs, quantities and notification destinations only.
- Do not request/store Aadhaar numbers, biometric data, OTPs, real registered mobile numbers, identity documents or real grievance attachments.
- Do not use real beneficiary datasets in screenshots, test fixtures, analytics or AI prompts.
- Do not copy login screens designed to collect official credentials.

## API and application security

- Validate all requests with schemas; escape rendered content; restrict CORS to configured origins.
- Use a server-side session with HTTP-only, Secure (production), SameSite cookies, session rotation after authentication, idle and absolute timeouts, and CSRF protection as appropriate.
- Hash passwords with Argon2id or bcrypt; apply login and card-verification rate limits and progressive delay.
- Add RBAC middleware and enforce shop scoping within services/queries.
- Never return password hashes, secret environment values, private notification payloads, or unnecessary card/profile fields.
- Use TLS in any non-local deployment; set secure headers (Helmet), restrictive CSP where compatible, body-size limits and file-upload disablement by default.
- Use parameterized SQL/ORM queries. No dynamic SQL from untrusted values.
- Generate unpredictable public complaint reference codes and avoid using them as the sole authorization factor for sensitive details.
- Audit all role changes, policy edits, stock movements, queue state changes and failed admin actions. Avoid logging card numbers or full complaint text.
- Store secrets only in environment/secret manager. Never embed Gemini or Telegram tokens into Vite client variables (`VITE_*`).

## AI and notifications

- Local FAQ answers are preferred and should include source links.
- AI output is informational and not the source of truth for a legal entitlement, price or eligibility decision.
- Apply timeout, rate limit, output-size limit and error fallback; log metadata rather than full sensitive prompts.
- Telegram adapter is disabled unless configured. Send only to explicitly opted-in test recipients. Don't send real card numbers in alerts.
- Queue creation/completion must succeed even if assistant/notification services are down.

## Before wider/public deployment

Obtain appropriate authorization, review applicable government hosting/branding rules, privacy and cybersecurity requirements, data-processing permissions, official API access, security testing, incident response and operational support. Replace demo verification with an approved identity integration only after authorization. This pack is not legal advice or production security certification.
