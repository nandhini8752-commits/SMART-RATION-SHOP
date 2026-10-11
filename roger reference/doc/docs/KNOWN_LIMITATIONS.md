# Known Limitations / Not Yet a Production Service

- No connection to TNPDS, RCMS, ePoS, UIDAI, Aadhaar authentication or government databases.
- All ration cards, beneficiary names, shops, stock quantities and queue events are synthetic.
- No entitlement amount or subsidy price is pre-seeded as official truth. Rules must be configured and sourced before use.
- Shop hours and coordinates in seed data are illustrative, not verified real locations.
- Notification provider is a mock by default; Telegram is optional and must use test recipients.
- AI is optional, not a policy source of truth; local FAQ should keep essential help available.
- Demo complaint filing does not contact a government grievance redressal system.
- Queue time is an estimate driven by demo configuration and is not guaranteed.
- Accessibility, localization, load and security claims require actual test results; this pack sets targets but does not certify compliance.
- Before an actual trial with beneficiaries, obtain authorization, verify data sources, conduct threat modelling/security review, define support ownership and retention, test on low-end devices, and document incident response.
