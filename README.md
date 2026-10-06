# EVE (E-waste Value & Evidence)

Hackathon demonstrator: an Expo app plus a tiny Node server. Concept demo, not affiliated with any wallet provider.

## Install and run

```
npm install
npm run dev
```

`npm run dev` starts the server on port 4000 and Expo. Scan the Expo QR with Expo Go (phone and laptop on the same network, or the laptop on the phone's hotspot). For a browser preview open http://localhost:8081.

Set `EXPO_PUBLIC_API_URL` (see `apps/mobile/.env.example`) if the app cannot find the server. The maps use OpenStreetMap tiles and need internet.

## Demo controller

Open `http://<laptop-ip>:4000/sim` (the server prints the URL on start). Big buttons: Next step, Back, Reset, and toggles for Weight shortfall, Unlicensed recycler and Tamper. The phone follows within about 2 seconds. The page also shows QR codes the phone can scan.

## Reset

Press Reset on `/sim`, or run `npm run reset` while the server is up.

## DOE collection points

`apps/mobile/src/data/doe-points.json` holds 407 real collection points copied once from the DOE directory (https://ewaste.doe.gov.my/index.php/about/list-of-collectors/) on 6 Oct 2026, with coordinates, phone, hours and accepted items. The Recycle map shows those within 40 km of the demo user; the nearest three get lettered pins. To refresh, re-copy the entries from the directory into that JSON (same fields). The app never fetches the DOE site at runtime; check the site's terms before any automated collection.
