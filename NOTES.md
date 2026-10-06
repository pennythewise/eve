# Assumptions

- Demo Mode: all lists and numbers are hard-coded and marked PLACEHOLDER. Server state is one `demoState` object in memory.
- The server stage drives every tab; the phone polls `/api/state` every 2 seconds.
- Phone-initiated steps: creating an item passport moves stage 0 to 1; Request pickup moves stage 1 to 2.
- Scan QR accepts any QR in demo mode; `eve:driver:*` signs the handover, `eve:point:*` records a drop-off, `eve:lot:*` opens a passport. Web builds use the on-screen demo shortcuts.
- Maps use MapLibre GL on OpenStreetMap raster tiles, and road routes come from the public OSRM demo server. Both need internet. CARTO was dropped: its vector tiles decoded empty and its raster URLs return an "API key required" placeholder.
- Unlockable progress only counts a lot once stage 9 is reached with no flags and no tamper.
- Points: one balance (seeded 380, +42 on release), spent on vouchers.
- DOE points are real entries from the DOE directory (copied 2026-10-06, 407 with valid coordinates). The demo user's location is a fixed PLACEHOLDER near Taylor's Lakeside Campus, so distances are straight-line from there. The Activity route uses the nearest real point as its collection-point stop.
