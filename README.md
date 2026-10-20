# PO.TORO Portal

Concept cafe PO.TORO official portal site.

## Pages

- `index.html`: portal top
- `news.html`: news list
- `events.html`: event list
- `goods.html`: goods distribution list
- `games.html`: games and diagnosis links
- `omikuji.html`: daily fortune
- `passport.html`: PO.TORO passport lesson
- `menu.html`: drink and food menu
- `schedule.html`: weekly schedule
- `price.html`: price system
- `uniforms.html`: historical uniforms
- `404.html`: not-found guidance
- `recruit/`: cast recruitment

## Operations

- Dynamic news, event, goods, and schedule data are loaded from the URLs in `assets/js/config.js`.
- Publishing and data-update checks are documented in `docs/operation-checklist.md`.
- Shared design tokens and components live in `assets/css/design-system.css`.
- Shared header and footer sources live in `_includes/`; run `node scripts/sync-shared-layout.js` after editing them.
- The public HTML files remain deployable directly by GitHub Pages; no production build step is required.
- Shared layout maintenance and rollout rules are documented in `docs/shared-design-system.md`.
- Page-specific styles live in `assets/css/`.
- `robots.txt` points crawlers to `sitemap.xml`.
- `potoro-profile-public/` is a separate workspace folder and is intentionally ignored by this repository.
- When adding or removing public pages, update the page registry in `scripts/sync-shared-layout.js` and `sitemap.xml` together.

## Public URL

- https://potoro1001.github.io/potoro-portal/

## Quick Checks

- Run `node scripts/validate-site.js` before publishing broad navigation or page changes.
- Run `node scripts/sync-shared-layout.js --check` to verify that every public page matches the shared header and footer sources.
- Run `node scripts/check-public-site.js` after GitHub Pages deployment to confirm the public pages and critical assets respond.
- Confirm there are no broken local links after editing page links.
- Check mobile and desktop layouts for horizontal overflow.
- Check pages that load Google Sheets CSV data still show a useful fallback message when loading fails.
