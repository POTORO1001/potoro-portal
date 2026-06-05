# PO・TORO Portal

concept cafe PO・TORO official portal site.

## Pages

- `index.html`: portal top
- `news.html`: news list
- `events.html`: event list
- `goods.html`: goods distribution list
- `games.html`: games and diagnosis links
- `schedule.html`: weekly schedule
- `price.html`: price system
- `uniforms.html`: historical uniforms
- `recruit/`: cast recruitment

## Operations

- Dynamic news, event, goods, and schedule data are loaded from the URLs in `assets/js/config.js`.
- Page-specific styles live in `assets/css/`.
- `robots.txt` points crawlers to `sitemap.xml`.
- `potoro-profile-public/` is a separate workspace folder and is intentionally ignored by this repository.
- When adding or removing public pages, update the shared header/footer links and `sitemap.xml` together.

## Public URL

- https://potoro1001.github.io/potoro-portal/

## Quick Checks

- Confirm there are no broken local links after editing page links.
- Check mobile and desktop layouts for horizontal overflow.
- Check pages that load Google Sheets CSV data still show a useful fallback message when loading fails.
