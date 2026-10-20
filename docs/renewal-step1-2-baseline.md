# PO.TORO Renewal STEP 1-2 Baseline

## Starting point

- Recorded: 2026-10-20 (Asia/Tokyo)
- Source: latest `origin/main` fetched at the start of this task
- Source commit: `083c7fd`
- Renewal branch: `codex/renewal-classical-fantasy`
- Worktree: managed worktree separated from the production checkout
- Production URL: `https://potoro1001.github.io/potoro-portal/`

No production branch, publishing setting, public URL, spreadsheet URL, or Apps Script URL was changed.

## Baseline checks

- Local validator before renewal: 13 pages passed.
- Public checker before renewal: 12 pages and 57 assets passed.
- Baseline screenshots captured at 1440 x 1000 and 390 x 844.
- Screenshot artifacts: `baseline-desktop.png` and `baseline-mobile.png` in the task visualization output.

## Functional contracts retained on the top page

- Breaking news: `sokuhouAlert`, `sokuhouAlertLink`, `sokuhouAlertTrack`
- Business hours: `todayHours`
- Availability: `seatsStatus`, `seatsStatusDot`, `seatsStatusLabel`, `seatsStatusMessage`, `seatsStatusUpdated`
- Today's maids: `todayMaidsWrap`
- Reservation link: `reserveBtn`
- News: `newsList`
- Drawer: `btnMenu`, `drawer`, `drawerScrim`, `btnClose`
- First-visit modal: `openFirstGuide`, `modalFirst`
- Common footer year: `year`

The existing data modules remain unchanged. The prototype adds existing schedule and event modules to the top page without changing their endpoints or response formats.

## Prototype scope

Only `index.html` is opted into the new visual layer through `body.theme-v2`. Other pages keep the current design until the top page is reviewed and approved.
