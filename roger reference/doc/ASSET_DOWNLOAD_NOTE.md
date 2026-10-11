# Asset download note

The implementation runtime could not retrieve the third-party image files directly. The pack therefore includes:
- A local, original SRQMS mark at `assets/logos/srqms-mark.svg`.
- Verified download URLs and license/source notes in `10_ASSETS_AND_REFERENCES.md` and `docs/ASSET_CREDITS.md`.
- An optional `scripts/fetch_reference_assets.sh` script to download the reference files on a machine with internet access.

The asset script is intentionally not run automatically. Review license, official-identity usage, project approval and attribution before adding downloaded government identity assets to a visible page. The default app should work with the SRQMS mark alone.
