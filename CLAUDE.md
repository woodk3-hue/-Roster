# Shift Roster

Single-file PWA (`index.html` + `sw.js`), hosted on GitHub Pages at
https://woodk3-hue.github.io/-Roster/ . Real people use the root copy every day.

## Test first, then release

- **New features and fixes go into `test/` first** (`test/index.html`, `test/sw.js`), not the
  root files. The test copy is served at https://woodk3-hue.github.io/-Roster/test/ and only the
  owner uses it.
- The test copy is the *same code*: `index.html` detects `/test/` in the address
  (`window.IS_TEST_BUILD`) and then keeps its saved data (localStorage keys prefixed `TEST:`),
  device backup, offline cache and Family Sync area (`roster/TEST-<PIN>`) separate from the real
  app, skips usage check-ins and shows a red TEST VERSION label. Keep it that way: never add
  code that only works in one copy.
- **Release** (only when the owner says the test version works): copy `test/index.html` →
  `index.html` and `test/sw.js` → `sw.js` byte for byte. Bump the cache number in `sw.js`
  (`PREFIX+'3'` → `'4'`, …) when cached files change. `test/manifest.json` stays different
  (test name).
- With each release, set `APP_VERSION` (the release date) and the `WHATS_NEW` list in `index.html` to
  what changed, in plain words. Users see an "update ready — Refresh" banner (the new `sw.js` triggers
  it) and then the What's new card once.
- Validate before pushing: `node --check sw.js`, load the page in headless Chromium
  (`/opt/pw-browsers/chromium`) and check there are no page errors.
