# SRQMS Validation Demo Script

**Length:** 8–12 minutes. **Environment:** local/demo deployment only. All records are fictional.

1. Open the landing page. Point out the persistent prototype disclosure and language switch.
2. Switch to Tamil. Show that navigation, field labels, errors and queue status change without clipping.
3. Open Find a Shop and search for `Anna Nagar`. Open `DEMO-CHN-001` and call attention to the demo-stock label and timestamp.
4. Go to Verify Demo Card and use `DEMO-TN-0001`. Explain that this is a synthetic card, not a live government verification.
5. Review the entitlement page. Explain that quantities must be configured in the admin panel and visibly labelled as demo unless the source and effective date have been verified.
6. Create a token. Show token number, position, number ahead and approximate wait.
7. Open the seeded shop operator account from a separate browser session. Sign in using credentials printed only by the local seed command; do not put default passwords in public docs/screenshots.
8. Call next at Counter 1. Return to the citizen token tracker and show status update.
9. Complete distribution using selected commodities and actual demo quantities. Explain that the server validates inventory and commits queue, distribution and stock ledger together.
10. Open inventory/ledger. Show one deduction per item and a clear reason/source link to the completed token.
11. Retry the completion request if the test harness permits; demonstrate that it does not deduct twice.
12. Open the admin audit page and show attributed events. End by distinguishing prototype functionality from government-authorized integration.

## Suggested validation questions

- Can a beneficiary understand the queue without staff explanation?
- Are Tamil labels and help copy understandable on a low-end Android phone?
- Does a user know which shop they are interacting with?
- Does the stock view distinguish “sample estimate” from actual shop stock?
- Would SMS/voice fallback be needed by the intended user group?
- What approval, official data source and operational owner would be required before a pilot?
