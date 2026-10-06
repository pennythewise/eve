# EVE Mobile App: Product Requirements Document (for the AI coding agent)

**Project:** EVE (E-waste Value & Evidence). Hackathon demonstrator, NextGen ESG Sprint 2026, Track A (Waste to Value), E-Waste stream.
**Deadline:** final submission 3:00 PM, 6 Oct 2026. Build the P0 slice first, then P1, then P2. Never leave the app in a broken state.
**Reference code:** `reference/eve.py` (already tested) holds the hash-chain, weight, licence, order and wallet-release logic. Use it as a reference for the rules and wording only (see the Demo Mode override below).

---

## DEMO MODE OVERRIDE (this section wins over everything below)

**The goal is a pretty, demo-functional app. Hard-coding is allowed.** Judges see the phone and the laptop, not the code. Spend the time saved on visual polish.

### What may be hard-coded
All lists and numbers: DOE points, drivers, funds, P/L figures, vouchers, the network audit table, the device-check result, timeline contents, impact items, wallet amounts, short fake-looking hashes. Skip real signatures, persistence, input validation, authentication, SSE, the offline fallback and real hash computation.

### What must genuinely work (these make the demo credible)
1. The phone talks to a **tiny Node server** over HTTP (Express, one file is fine, no database).
2. The server holds one shared object `demoState` (a `stage` number 0 to 9 plus three toggles). **Every tab on the phone renders from it.**
3. A web page at `/sim` on the laptop has big buttons: **Next step**, **Back**, **Reset**, and toggles **Weight shortfall**, **Unlicensed recycler**, **Tamper**.
4. The phone polls the server every 2 seconds. When the laptop presses Next step, the phone shows a toast and updates timeline, driver card, map marker, wallet and impact within about 2 seconds.
5. The camera really opens in Scan. Device check really captures 6 photos (Front, Back, Left, Right, Top, Bottom), then shows a fake 2-second progress bar and a **hard-coded** result card.
6. Scan QR accepts the QR codes shown on the `/sim` page (and in demo mode may accept any QR) and advances "Handover signed".
7. The map is a real map with hard-coded DOE points. The driver marker moves along a hard-coded path as the stage advances.
8. The raised centre scan button, five tabs, fonts, spacing and colours must match the design system below. **Pretty is graded.**

### Stage table (what the UI shows at each stage)
| Stage | Meaning | Phone shows |
| --- | --- | --- |
| 0 | Fresh start | Seeded history, empty pickup card |
| 1 | Item registered | New item in Activity; wallet **Held RM 4.20** |
| 2 | Pickup requested | Pickup card "Looking for a driver" |
| 3 | Driver assigned | Driver card (name, plate, ETA 8 min), toast |
| 4 | On the way | Driver marker moves toward the user, ETA counts down |
| 5 | Picked up | Timeline "Picked up, confirmed by both sides" |
| 6 | At DOE collection point | Timeline step with the point's name |
| 7 | At licensed recycler | Held credit becomes **Released** (balance rises, toast) |
| 8 | Material recovered | Timeline step with recovered grams; Impact progress rises |
| 9 | Received by manufacturer | Lot **Complete**; chain badge green; unlockable progress |

Toggles change the story: **Weight shortfall** adds a red WEIGHT_MISMATCH flag at stage 6 or 7; **Unlicensed recycler** adds UNLICENSED_RECEIVER at stage 7 and moves credit to "Under review"; **Tamper** turns the chain badge red ("Chain broken at event #3") and highlights that row. The Network audit table (hard-coded sample plus live increments) updates its red highlight when a flag is on.

### Order of work (target about 1 to 1.5 hours with an agent)
1. Expo shell, five tabs, raised scan button, design tokens, shared components, Inter font.
2. All five tabs and the Scan modal built with hard-coded data, looking finished.
3. Tiny server, `demoState`, `/sim` page, 2-second polling, toasts.
4. Real camera, QR scanning, 6-sided capture, map with markers.
5. Polish: spacing, transitions, skeleton loaders, locked and unlocked impact art.

Sections 5.3 (signatures), 8 (SSE) and the P2 items in section 10 are **out of scope** in Demo Mode. Everything else below is still the visual and behavioural spec.

---

## 0. What you are building, in one paragraph

A mobile app (Expo Go, runs by scanning a QR from the terminal) plus a small Node backend. A citizen registers an e-waste item, requests a pickup or drops it at a collection point, and follows it through driver, DOE-certified collection point, licensed recycler and manufacturer. Every handover is a signed, hash-chained record. The citizen's reward is held until the chain is clean, then released into a wallet. A separate web "demo controller" on the laptop advances the process (driver accepts, picks up, delivers and so on). **When the laptop does a step, the phone updates within about 2 seconds.** That live link between the two halves is the most important thing in this build.

Everything external is mocked (drivers, DOE list, recyclers, manufacturers, funds, vouchers, device evaluation). The frontend and backend must still be genuinely connected over HTTP and share state.

---

## 1. Principles (read before coding)

1. **Professional, plain, non-AI look.** No sparkle icons, robots, chat bubbles or the letters "AI" anywhere in the UI. Call the camera feature "Device check", not "AI scan".
2. **TNG-style layout, not TNG branding.** Borrow layout, sizes and rhythm of a mainstream Malaysian e-wallet app (large balance card at top, rounded cards, bottom tab bar with a raised centre action). Do **not** use TNG logos, names, icons or colours. Add "Concept demo, not affiliated with any wallet provider" in the Labur screen footer and the About line.
3. **Mock first, but linked.** One shared backend state. No screen reads hard-coded data that the backend could own, except static lists (DOE points, vouchers) which the backend serves.
4. **Honest labels.** Anything that is not real must be labelled: "Estimate", "Simulated", "Concept". Investment features are a concept simulation, not a real product.
5. **Smallest dependency set that works in Expo Go.** No custom native modules, no dev client, no EAS build.
6. **TypeScript strict** on both apps. Shared types in `packages/shared`.

---

## 2. Tech stack

| Area | Choice | Notes |
| --- | --- | --- |
| Mobile | Expo (latest SDK that matches the current Expo Go in the app stores), React Native, TypeScript | Create with `npx create-expo-app@latest`. Check Expo Go compatibility before adding any package. |
| Navigation | `expo-router` (file-based tabs) | Bottom tabs with a custom raised centre button. |
| Data fetching | `@tanstack/react-query` | `refetchInterval: 2000` on live screens. |
| Camera and QR scan | `expo-camera` (`CameraView`, built-in barcode scanning) | Request permission with a friendly rationale. |
| Show a QR | `react-native-qrcode-svg` + `react-native-svg` | Both work in Expo Go. |
| Maps | `react-native-maps` | Works in Expo Go. Markers for DOE points, user and driver. |
| Location | `expo-location` | Foreground only. |
| Icons | `@expo/vector-icons` (Feather or Ionicons, outline style) | |
| Font | Inter via `@expo-google-fonts/inter` (400, 500, 600, 700) | Use tabular numerals for money. |
| Haptics | `expo-haptics` | Light tap on scan success. |
| Share | React Native `Share` API | For the report button. No extra package. |
| Backend | Node 20+, Express, TypeScript run with `tsx` | |
| Storage | In-memory state persisted to `data/db.json` | No native database (avoids install failures). |
| Crypto | Node `crypto`: SHA-256 for the chain, Ed25519 for signatures | |
| Dev runner | `concurrently` at the repo root | |

### Repo layout (npm workspaces)

```
eve/
  package.json            # workspaces + scripts
  PRD.md
  reference/eve.py        # tested logic to port
  packages/shared/        # shared TS types and constants
  apps/server/            # Express API + /sim demo controller
  apps/mobile/            # Expo app
```

### Scripts (root `package.json`)

| Script | Does |
| --- | --- |
| `npm run dev` | Starts the server (port 4000) and `expo start`. Expo prints the QR in the terminal. Scan it with Expo Go. |
| `npm run dev:tunnel` | Same, but `expo start --tunnel` (see networking note). |
| `npm run reset` | Deletes `data/db.json` and re-seeds. |

**Acceptance for setup:** from a fresh clone, `npm install` then `npm run dev` prints a scannable QR and the app opens in Expo Go with seeded data.

### Networking (the part that usually breaks)

- Phone and laptop must be on the **same network**. Campus Wi-Fi often isolates devices; if so, put the laptop on the phone's hotspot.
- The app finds the server automatically: derive the host from `Constants.expoConfig?.hostUri` (strip the port) and use port 4000. Allow override with `EXPO_PUBLIC_API_URL`. Fall back to `http://localhost:4000`.
- Tunnel mode only exposes the Expo bundle, not the API. If tunnel is needed, expose port 4000 with a second tunnel and set `EXPO_PUBLIC_API_URL`.
- Server binds to `0.0.0.0`. Print the LAN URL and the `/sim` URL in the terminal on start.
- On the home screen, show a small "Connected" or "Offline demo data" pill. **P1 fallback:** if the API is unreachable, use a local in-app mock adapter so screens still render (live sync is lost in this mode).

---

## 3. Design system

**Direction:** clean fintech layout, emerald-teal and white, generous whitespace.

### Colour tokens

| Token | Hex | Use |
| --- | --- | --- |
| `primary` | `#0A9C8A` | Buttons, active tab, key numbers |
| `primaryDark` | `#067A6D` | Pressed states, headers |
| `primaryDeep` | `#054F49` | Large balance card gradient end |
| `primarySoft` | `#D9F3EE` | Chips, selected rows, icon backgrounds |
| `background` | `#F4FAF9` | Screen background |
| `surface` | `#FFFFFF` | Cards |
| `text` | `#0B2B28` | Primary text |
| `muted` | `#5E7B77` | Secondary text |
| `border` | `#DCEBE8` | Dividers |
| `success` | `#1FAF6B` | Clean, released, verified |
| `warning` | `#E8A317` | Held, in progress |
| `danger` | `#D64545` | Flags, broken chain |

Balance card: linear gradient `primary` to `primaryDeep`, white text. Everything else is white cards on `background`.

### Type and layout

| Element | Spec |
| --- | --- |
| Page title | Inter 700, 28 |
| Section title | Inter 600, 18 |
| Card title | Inter 600, 16 |
| Body | Inter 400, 15 |
| Caption | Inter 500, 12, `muted` |
| Big number | Inter 700, 34, tabular |
| Page padding | 16 |
| Card radius | 16 (large cards 20) |
| Gap between cards | 12 |
| Minimum tap target | 44 |
| Card shadow | very soft (offset 0/2, opacity 0.06) |

### Components to build once and reuse

`Card`, `SectionHeader`, `Chip` (status colours), `PrimaryButton`, `SecondaryButton`, `Timeline` (vertical steps with done/current/pending), `ProgressBar`, `Toast` (top, auto-dismiss 3s), `EmptyState`, `SkeletonRow`, `SegmentedControl`, `StatTile`.

### Bottom tab bar (left to right, five items)

| # | Label | Icon | Notes |
| --- | --- | --- | --- |
| 1 | Recycle | recycle or repeat | |
| 2 | Labur | trending-up | Wallet and funds |
| 3 | (no label) | scan / maximize | **Centre button, taller than the others.** A 60 px emerald circle raised about 16 px above the bar with a white border and soft shadow. Opens the Scan screen as a full-screen modal, not a tab page. |
| 4 | Activity | activity or list | |
| 5 | My Impact | award or leaf | |

Bar height about 64 plus safe area. Active tab uses `primary` icon and label; inactive uses `muted`.

---

## 4. Screens

### 4.1 Recycle (tab 1)

Top app bar: greeting ("Hi, Demo User"), small avatar, connection pill. Below it, two stacked sections.

**1.1 Pickup section (upper)**

Two states, driven by `GET /api/pickups/active`.

- **No active pickup:** a card "Request a pickup". Shows the user's registered items (from Scan > Device check) as selectable rows. Toggle "Share my location". Pick a time window (Now, This afternoon, Tomorrow morning). Button "Request pickup". If there are no items yet, show an `EmptyState` with a button that opens Scan > Device check.
- **Active pickup:** a driver card showing driver name, vehicle plate, rating (all mock), status chip, ETA, and a 4-step mini progress (Requested, Driver assigned, On the way, Picked up). Text mirrors the status, e.g. "Driver is on the way to pick up your items, about 6 min away." Toggle "Share my location" stays visible. A "Call driver" button shows a mock dialog.

**1.2 Map (lower)**

- `react-native-maps` filling the remaining space (minimum height 280).
- Markers for **nearby DOE-certified collection points** (see section 7.8 for the mock list). The user's marker uses location permission, with a fixed fallback near Taylor's Lakeside Campus if denied.
- While a pickup is active and location sharing is on, show the **driver marker moving toward the user** (position computed by the server from elapsed time, polled every 2 seconds).
- Tapping a marker opens a bottom card: name, address, opening hours, distance, "Directions" (opens the native maps app via `Linking`) and "Drop off here" (opens Scan > Scan QR with a hint).
- A horizontal list of the 3 nearest points sits under the map.
- Footnote: "Collection points are listed from the DOE directory. Always check opening hours before visiting." The mock data is replaced later with real entries (section 7.8).

### 4.2 Labur (tab 2)

A concept simulation of a wallet with funds. Footer on screen: "Concept demo. Not a real investment product. Not affiliated with any wallet provider."

**2.1 Wallet card (upper)**

- Large gradient card: label "Total balance", amount in RM (Big number), below it "Open P/L +RM x.xx (+y.yy%)" in a light chip (green if positive, red if negative).
- Sub-row: "Available RM x.xx" and "Held RM x.xx" (held = credit waiting for a clean delivery). Tapping "Held" shows a sheet explaining "Released after your item reaches a licensed recycler with a clean record."
- Tapping the card opens **Portfolio breakdown** (stack screen): a list of holdings (fund name, invested, current value, P/L RM and %), a simple allocation bar, and buttons "Invest" and "Withdraw".
- **Invest** moves RM from available to a chosen fund. **Withdraw** moves it back. Both call the API.

**2.2 Funds (lower)**

- Section "Funds". A **horizontally scrolling row of smaller square cards** (about 140 x 140): fund name, one-line description, mock 1-year return, risk chip.
- Tapping a card opens fund detail: description, mock chart (simple line from the server's demo series), minimum amount, "Invest" button.
- Mock funds (names are placeholders): "E-waste Value Fund (Concept)", "Circular Economy Basket (Concept)", "Green Money Market (Concept)".
- P/L moves using a **demo clock** (accelerated time, 1 real minute = 1 simulated day) so judges can watch it change. Label: "Simulated growth".
- Show an "Early-bird bonus" ribbon on held credits if the server provides a multiplier greater than 1.

### 4.3 Scan (centre button, full-screen modal)

Top: close button, title "Scan", and a `SegmentedControl` with three modes. Default mode is **Scan QR**.

**3.1 My QR**
- Shows a large QR code (white card, `react-native-qrcode-svg`).
- A selector above it: the user's active **item passports** (lot IDs) and "My ID".
- Payload formats: `eve:lot:<LOT_ID>` and `eve:user:<USER_ID>`.
- Caption: "Show this to the driver or collection point."

**3.2 Scan QR**
- Live camera with a square viewfinder overlay and a torch toggle.
- On scan, call `POST /api/scan { payload }`. The server decides what the QR means:

| QR payload | Meaning | Result |
| --- | --- | --- |
| `eve:driver:<ID>` | Driver at handover | Records the giver's signature for the pickup. Result card: "Handover signed. Waiting for the driver" or "Confirmed by both sides". |
| `eve:point:<ID>` | DOE collection point (self drop-off) | Creates a drop-off handover to that point; result card with weight prompt (the point "scale" is simulated in `/sim`). |
| `eve:lot:<ID>` | An item passport | Opens that item's timeline. |

- Unknown QR: friendly error toast. Haptic tap on success.

**3.3 Device check (6-sided capture)**
- Guided capture, one photo per side, in order: Front, Back, Left, Right, Top, Bottom. Show a progress "2 of 6", a side-specific outline overlay, and thumbnails of captured sides with a "Retake" option.
- After six photos, show "Check device". Show a short determinate progress (about 2 seconds, "Reviewing images").
- Call `POST /api/devices/evaluate` with the photo count (and, optionally, small base64 thumbnails). **The server returns a mocked, deterministic result:** device type, condition (Working or Not working), estimated weight (g), estimated recoverable value range (RM), and a battery flag.
- Result card: type, condition, weight, value range labelled **"Estimate"**, and a red "Contains battery, keep upright and separate" notice when the flag is set. The user can correct the device type from a dropdown.
- Button "Create item passport" calls `POST /api/lots`. Then show the QR (mode 3.1) for the new lot.
- No "AI" wording on this screen.

### 4.4 Activity (tab 4)

One scrolling page with two sections.

**4.1 My items (upper)**
- A horizontal picker of the user's items (lot ID and device name).
- For the selected item, a **vertical `Timeline`**: Registered, Driver assigned, On the way, Picked up, At collection point, At licensed recycler, Material recovered, Received by manufacturer, Complete. Each step shows time, the actor (e.g. "Driver Aiman", "DOE-certified point: Subang", "Recycler (licensed): ...", "Manufacturer: ...") and the location where relevant.
- Above the timeline: **device status chip** ("In transit", "At recycler"...), driver card (when relevant), and a **chain badge**: green "Record verified" or red "Chain broken at event #N".
- A flagged step shows a red chip with the flag name (WEIGHT_MISMATCH, UNLICENSED_RECEIVER, OUT_OF_ORDER, OUTPUT_EXCEEDS_INPUT) and a one-line plain explanation.
- Each timeline step can expand to show the short record hash (first 8 characters) and "Signed by both sides".

**4.2 Network audit (lower)**
- Section header "Network audit" with caption "All lots across the pilot (sample data plus live items)".
- **Hop table** (data from `GET /api/audit/hops`):

| Hop | Lots | Flagged | Main flag |
| --- | --- | --- | --- |
| Box or giver to driver | 40 | 1 | weight mismatch |
| Driver to collection point or recycler | 38 | 6 | weight mismatch, unlicensed |
| Recycler to manufacturer | 30 | 0 | none |

  These figures are **seeded sample data**; live lots add to them. The row with the highest flag count is highlighted in red.
- **By actor list** (from `GET /api/audit/actors`): e.g. `COLLECTOR-A 0 flags`, `COLLECTOR-B 5 flags` with an "Investigate" chip on the highest. Tap an actor to see its flagged lots.
- **Report button** ("Generate report"): calls `POST /api/audit/report`, opens a summary screen (date, totals, flagged hops, worst actors, chain status) and a "Share report" button using the RN `Share` API with the report as text.
- Footnote: "A flag shows a mismatch, not guilt. Scales and rounding can cause small differences."

### 4.5 My Impact (tab 5)

**5.1 Unlockables (upper)**
- A 2-column grid of illustrated icons (simple flat cartoon style, drawn with SVG or vector icons, no stock photos): motherboard, oven, phone, laptop, battery, copper coil, etc.
- Locked items are faded (opacity about 0.35) with a small lock badge and a progress bar "420 g of 1,000 g". Unlocked items are full colour with a tick.
- Unlock thresholds are **mock constants in `packages/shared`** (grams of verified recycled material). Progress comes from `GET /api/impact` and only counts lots with a clean, completed chain.
- Tap an item for a sheet: "Recovered material equals about x% of the material in a new {item}". **Label the equivalent as illustrative** and keep the assumptions in a constants file with a comment.
- Top of the section: stat tiles (Total kg recycled, Items, Clean chains).

**5.2 Vouchers (lower)**
- Section "Redeem". Vertical or horizontal list of voucher cards: generic names such as "Electronics retailer voucher RM10" (placeholder; no real brand names and no implied partnerships), cost in points, expiry.
- Points equal released wallet credit converted at a mock rate (or a separate points balance; keep one and document it).
- "Redeem" calls `POST /api/vouchers/:id/redeem`, deducts points, and shows a code with a small QR.
- Footer: "Illustrative offers. No partnership implied."

---

## 5. Backend

### 5.1 Data model

| Entity | Key fields |
| --- | --- |
| `User` | id, name, publicKey, createdAt (one seeded demo user) |
| `Actor` | id, role (`citizen`, `driver`, `point`, `recycler`, `manufacturer`), name, licensed (boolean), publicKey, secretKey (demo only, server-held) |
| `DoePoint` | id, name, address, state, lat, lng, hours, actorId |
| `Lot` | id (`EVE-XXX-NNNNN`), userId, category, condition, weight_g, value_rm, batteryFlag, status, flags[], createdAt |
| `Event` (ledger) | id, ts, lotId, event, category, from, to, weight_g, value_rm, flags, sigFrom, sigTo, prevHash, hash |
| `PickupJob` | id, userId, lotIds[], status, driverActorId, userLat, userLng, shareLocation, window, driverLat, driverLng, etaMin, createdAt |
| `Wallet` | userId, available, held, pointsBalance |
| `WalletTx` | id, ts, type, amount, lotId?, state (`HELD`, `RELEASED`, `UNDER_REVIEW`) |
| `Fund` | id, name, description, risk, annualRate, series[] |
| `Holding` | userId, fundId, principal, startedAtDemoClock |
| `Voucher` | id, title, costPoints, expiry |
| `Redemption` | id, userId, voucherId, code, ts |
| `Change` | seq, ts, type, message (feeds in-app toasts) |

### 5.2 Lot status machine

```
REGISTERED -> PICKUP_REQUESTED -> DRIVER_ASSIGNED -> EN_ROUTE -> PICKED_UP
  -> AT_POINT -> AT_RECYCLER -> RECOVERED -> MANUFACTURER_RECEIVED -> COMPLETE
(any step may add flags; a flagged lot shows FLAGGED overlay but keeps its position)
Self drop-off path: REGISTERED -> AT_POINT -> AT_RECYCLER -> ...
```

### 5.3 Ledger events and rules (port from `reference/eve.py`)

| Event | From to | Created when |
| --- | --- | --- |
| `REGISTER` | citizen to system | Item passport created |
| `PICKUP` | citizen to driver | Driver picks up (both sign) |
| `DELIVER_POINT` | driver (or citizen) to DOE point | Item reaches the collection point |
| `TRANSFER` | point to recycler | Item reaches the recycler |
| `RECOVER` | recycler to market | Recycler logs recovered output (g) |
| `MANUFACTURER_RECEIVE` | recycler to manufacturer | Manufacturer confirms receipt |

Rules:
- **Hash chain:** `hash = sha256(canonical_json(fields) + prevHash)`, first record's prev is `GENESIS`. Fields hashed: ts, lotId, event, category, from, to, weight_g, value_rm, flags, sigFrom, sigTo.
- **Dual signatures:** every handover event requires an Ed25519 signature from both giver and receiver over the canonical payload. The server holds demo keys for actors and signs on their behalf when the controller triggers a step; the citizen's signature is produced when the app scans the driver or point QR. Verify both signatures before appending. A missing or invalid signature rejects the event.
- **Flags** (do not block, but record and show):
  - `WEIGHT_MISMATCH` when the receiver's weight differs from the giver's declared weight by more than 5%.
  - `UNLICENSED_RECEIVER` when the receiving actor's `licensed` is false.
  - `OUT_OF_ORDER` when the previous event for the lot is not the expected one.
  - `OUTPUT_EXCEEDS_INPUT` when recovered output is greater than received weight.
- **Verification:** `GET /api/audit/chain` recomputes every hash and signature and returns `{ ok, brokenAt }`.
- **Wallet rule:** at `REGISTER`, credit = `value_rm x CITIZEN_SHARE (0.5)` is added as `HELD`. On a clean `TRANSFER` to a licensed recycler it becomes `RELEASED` (moves to available and adds points). If any flag exists on the lot it becomes `UNDER_REVIEW`.
- Value table (RM per kg by category) and `CITIZEN_SHARE` are **placeholders** in `packages/shared/constants.ts`. Comment clearly: "PLACEHOLDER, replace with sourced prices".

### 5.4 API (JSON over HTTP, base `/api`)

| Method and path | Purpose |
| --- | --- |
| `GET /me` | User, wallet summary, connection info |
| `GET /doe-points` | DOE point list (mock data) |
| `POST /devices/evaluate` | Mock device evaluation from capture count |
| `POST /lots` | Create item passport (REGISTER event, HELD credit) |
| `GET /lots`, `GET /lots/:id` | List and detail with timeline |
| `POST /pickups` | Request pickup for lots |
| `GET /pickups/active` | Active job with driver and positions |
| `POST /pickups/:id/share-location` | Toggle sharing |
| `POST /scan` | Resolve a scanned QR payload (see 4.3) |
| `GET /activity/timeline?lot_id=` | Timeline steps with actors, flags, hashes |
| `GET /audit/hops`, `GET /audit/actors` | Network audit tables (seed plus live) |
| `GET /audit/chain` | Verify chain |
| `POST /audit/report` | Build report object |
| `GET /wallet`, `POST /wallet/invest`, `POST /wallet/withdraw` | Wallet and funds |
| `GET /funds`, `GET /funds/:id` | Fund list and detail |
| `GET /impact` | Totals and unlockable progress |
| `GET /vouchers`, `POST /vouchers/:id/redeem` | Vouchers |
| `GET /changes?since=<seq>` | New change records for toasts |
| `POST /sim/step`, `POST /sim/tamper`, `POST /sim/reset` | Demo controller actions |

Errors: `{ error: string }` with a suitable status. Validate input with a small schema library or manual checks.

---

## 6. Demo controller (the laptop half)

Served by the backend at `http://<laptop-ip>:4000/sim`. A single plain HTML page, usable on a laptop, with large buttons. This is what makes the live link visible.

| Control | Effect |
| --- | --- |
| Lot selector | Picks the lot or job to act on (defaults to the latest) |
| **Accept job (driver)** | Assigns a mock driver, sets ETA, status `DRIVER_ASSIGNED`, toast on phone |
| **Driver on the way** | Status `EN_ROUTE`; driver position starts moving toward the user |
| **Mark picked up** | `PICKUP` event; needs the citizen's signature from the app scan (button also offers "Sign as citizen" for backup) |
| **Deliver to DOE point** | `DELIVER_POINT` event with a weight field |
| **Send to licensed recycler** | `TRANSFER` event with a weight field; clean path releases credit |
| **Send to UNLICENSED recycler** | `TRANSFER` event to the unlicensed actor; raises the flag |
| **Weight shortfall (next step)** | Checkbox: subtracts 25% from the receiver's weight |
| **Log recovery** | `RECOVER` event with an output field |
| **Manufacturer receives** | `MANUFACTURER_RECEIVE` event; lot `COMPLETE`; impact updates |
| **Tamper with a record** | Edits a stored event directly (bypassing the chain). The phone shows "Chain broken at event #N" in Activity |
| **Reset demo** | Re-seeds everything |
| QR sheet | Renders printable QR codes for the mock driver and every DOE point (for Scan QR) |

Each action appends a `Change` record so the phone shows a toast within about 2 seconds, and refreshes Activity, Recycle, Labur and Impact.

---

## 7. Mock data and seeds

### 7.1 Seeded user and wallet
One user "Demo User". Wallet: available RM 38.50, held RM 0, points 380, one holding of RM 20 in "E-waste Value Fund (Concept)".

### 7.2 Seeded history
Two completed lots (a charger set and an old phone) so Activity, Impact and the wallet are never empty on first launch.

### 7.3 Seeded network audit baseline
Hop table starts at 40 / 38 / 30 lots with 1 / 6 / 0 flags, and actors `COLLECTOR-A` (0 flags) and `COLLECTOR-B` (5 flags). Live lots add to these numbers. Mark as "sample data".

### 7.4 Actors
- Drivers: "Aiman" (licensed true), "Siti" (licensed true), with plates and ratings.
- DOE points: see 7.8. Each has an actor record.
- Recyclers: `RECYCLER-LIC01` (licensed), `RECYCLER-ILLEGAL` (not licensed).
- Manufacturer: one mock actor, e.g. "Manufacturer (demo)".

### 7.5 Funds
Three funds with placeholder annual rates (e.g. 3.0%, 4.2%, 2.5%) and a demo-clock series.

### 7.6 Unlockables
About 6 items with thresholds in grams (placeholder constants).

### 7.7 Vouchers
Three generic vouchers with placeholder point costs.

### 7.8 DOE collection points (MOCK, replace with real data)
The live DOE directory page could not be fetched while writing this PRD, so **use placeholder entries** near Taylor's Lakeside Campus (Subang Jaya, approx. 3.06, 101.62) and the Klang Valley, named "DOE Collection Point (Mock) A" and so on, with approximate coordinates. Keep the data in `apps/server/data/doe-points.json`.

**To replace later:** copy real entries from `https://ewaste.doe.gov.my/index.php/about/list-of-collectors/` by hand into that JSON file (name, address, state, phone, hours) and geocode addresses once with OpenStreetMap Nominatim (max 1 request per second, send a User-Agent, cache results in the JSON). Do not scrape on every app launch. Check the site's terms before any automated collection.

---

## 8. Live sync design

- The phone polls `GET /changes?since=<seq>` every 2 seconds and React Query refetches on live screens (`/pickups/active`, `/lots/:id`, `/activity/timeline`, `/wallet`, `/impact`).
- On a new `Change` record, show a `Toast` (e.g. "Driver Aiman is on the way", "Item reached the collection point", "RM 4.20 released to your wallet", "Flag raised: weight mismatch").
- All state lives on the server. The phone never advances a status itself, except the citizen's own signed scan.
- **P2:** replace polling with Server-Sent Events.

---

## 9. Acceptance criteria and demo script

The app is done when this script works end to end on a physical phone in Expo Go, with the controller open on the laptop.

1. `npm run dev`; scan the QR; the app opens with seeded data and a "Connected" pill.
2. **Scan > Device check:** capture 6 sides, run the check, create an item passport. The result shows an "Estimate", and the wallet shows a **held** amount.
3. **Recycle:** request a pickup with location sharing on. The pickup card appears.
4. On the laptop: **Accept job**. Within 2 seconds the phone shows a toast, the driver card, and the driver marker on the map.
5. Laptop: **Driver on the way**. The marker moves toward the user. Activity timeline updates.
6. Phone: **Scan > Scan QR** on the controller's driver QR. The handover shows "Handover signed". Laptop: **Mark picked up**. The timeline shows "Confirmed by both sides".
7. Laptop: **Deliver to DOE point**, then **Send to licensed recycler**. The held credit becomes **released**; **Labur** balance increases and a toast appears.
8. Laptop: **Log recovery**, then **Manufacturer receives**. The lot is **Complete**; **My Impact** progress increases.
9. Run a second item with **Send to UNLICENSED recycler** and **Weight shortfall**. Flags show on the timeline; credit is **under review**; the Network audit counts increase and the red row is highlighted.
10. Laptop: **Tamper with a record**. The phone shows **"Chain broken at event #N"** in Activity.
11. **Activity > Generate report** opens the summary and the share sheet works.
12. **Labur:** invest RM 10 in a fund; the P/L moves over the next minutes on the demo clock.
13. **My Impact > Redeem:** redeem a voucher; points drop and a code appears.

### Quality bar
- No crash on permission denial (camera, location): show a friendly explanation and a manual fallback.
- No red-screen errors in a 10-minute run.
- Every empty list has an `EmptyState`.
- All money shows 2 decimals with RM prefix.
- Works at common phone sizes (small and large), light mode only.

---

## 10. Build order

| Phase | Scope | Priority |
| --- | --- | --- |
| 1 | Monorepo, scripts, `npm run dev` showing the Expo QR, server health endpoint, app connects and shows "Connected" | P0 |
| 2 | Server: seed data, lots, ledger with hash chain and signatures, flags, wallet rule, `/changes`, `/sim` controller | P0 |
| 3 | Tab bar with raised centre button, design tokens, shared components | P0 |
| 4 | Scan: My QR, Scan QR, and the register flow (Device check with mock result) | P0 |
| 5 | Recycle: pickup request and active pickup card | P0 |
| 6 | Activity: My items timeline, chain badge, toasts | P0 |
| 7 | Labur: wallet card, held and released, holdings and fund cards | P1 |
| 8 | Activity: Network audit, report button | P1 |
| 9 | Recycle map with DOE points, nearest list, driver marker | P1 |
| 10 | My Impact: unlockables and vouchers | P1 |
| 11 | Offline mock fallback, SSE, polish, driver movement smoothing | P2 |

**Rule:** after each phase, run the app and the relevant part of the demo script. Do not start the next phase while the current one is broken. If time runs short, drop P2, then P1 items from the bottom up, and keep the P0 slice working.

---

## 11. Non-goals

Real authentication, real payments, real investment or regulatory features, real computer vision, real blockchain network, real DOE or wallet-provider integration, push notifications, dark mode, multi-user accounts, store submission.

## 12. Disclaimers to show in the app

- Labur screen: "Concept demo. Not a real investment product. Not affiliated with any wallet provider."
- Device check result: "Estimate only."
- Network audit: "Sample data plus live items. A flag shows a mismatch, not guilt."
- Vouchers: "Illustrative offers. No partnership implied."
- About: "EVE is a hackathon prototype. No personal data is collected beyond a demo ID."

## 13. Agent working rules

1. Read this whole document and `reference/eve.py` before writing code.
2. Ask no questions; make the smallest reasonable assumption and list assumptions in `NOTES.md`.
3. Keep commits small and run the app after each phase.
4. Do not add packages that need a dev client or native rebuild.
5. Do not use the letters "AI", sparkle icons or chatbot imagery in the UI.
6. Do not use any wallet provider's logo, name, icon or colour palette.
7. Mark every placeholder value with `PLACEHOLDER` in a comment.
8. Keep a `README.md` with: install, `npm run dev`, how to open `/sim`, how to reset, and how to replace the DOE list.
