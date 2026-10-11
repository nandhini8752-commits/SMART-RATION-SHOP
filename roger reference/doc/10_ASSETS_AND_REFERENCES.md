# 10 — Assets, Logo Sources & Official References

## Brand assets in this pack

### 1. SRQMS project mark — local SVG

Path: `assets/logos/srqms-mark.svg`  
Status: Original project mark made for this prototype; it is **not** an official government logo. Use it by default for development and demos.

### 2. Tamil Nadu Government emblem — optional external asset

The binary image could not be fetched into this runtime, so it is **not included locally**. Verified public file page:

- Wikimedia Commons file page: https://commons.wikimedia.org/wiki/File:Tamil_Nadu_Emblem.png
- Direct PNG: https://upload.wikimedia.org/wikipedia/commons/b/b9/Tamil_Nadu_Emblem.png
- The Commons page describes the uploaded file as CC BY-SA 3.0 and names Jazzjohnn as author. Review the license page and suitability before redistributing or adapting it. The license terms say attribution is required and use must not imply the author endorses the usage.
- Attribution suggestion if the exact file and terms are used: “Tamil Nadu Emblem.png by Jazzjohnn, via Wikimedia Commons, CC BY-SA 3.0; no changes.” Link both file and license; note any changes if made.

This source is a community-uploaded asset, not a guarantee that the usage is authorized as an official government identity. For a prototype, prefer the SRQMS mark unless the context and usage rights are confirmed. Never recreate the state emblem with AI or approximate vector artwork.

### 3. State government header flag/logo asset reference

The Chennai District official website loads an image at: https://chennai.nic.in/wp-content/themes/dbim-theme/images/flag.svg . Treat this as a reference asset only; verify current usage terms with the site's published policies. Do not assume all page assets are available for unrestricted reuse.

## Official references for UI/content research

| Reference | URL | Use for |
|---|---|---|
| TNPDS | https://www.tnpds.gov.in/home.xhtml | Existing citizen portal and official service link |
| Civil Supplies & Consumer Protection Department | https://www.consumer.tn.gov.in/ | Department name, public resources and contact information |
| Fair price shop information | https://www.consumer.tn.gov.in/fairprice.htm | Existing “Know Your Shop/stock” service concepts |
| TNCSC PDS page | https://tncsc.tn.gov.in/en/PDS.html | Public commodity categories and explanatory content; verify again before relying on policy figures |
| Chennai District PDS services | https://chennai.nic.in/service/public-distribution-system-services/ | Ration-card service nomenclature and official links |
| NFSA Tamil Nadu | https://nfsa.gov.in/State/TN | State-level PDS context and helpline reference |

## Asset implementation rules

- Put image/asset attribution in `docs/ASSET_CREDITS.md` and keep it in the public repository.
- Do not hotlink an unofficial third-party “TNPDS logo” from unrelated domains.
- Don't download government portraits or seals from random image search results.
- Make assets local after license and source verification; avoid runtime calls to remote logo URLs for reliability.
- Use Lucide React icons for service tiles; no extra logo package is needed.
- Keep the prototype disclosure adjacent to any optional government emblem, and don't use wording such as “official portal”, “authorized”, “government verified”, or a fake `gov.in` domain.
