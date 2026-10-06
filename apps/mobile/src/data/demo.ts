import doePoints from './doe-points.json';

export interface DoePoint { id: string; name: string; address: string; city: string; state: string; lat: number; lng: number; phone: string; hours: string; items: string[] }

// All demo data is hard-coded (PLACEHOLDER) per the PRD's Demo Mode override.

export const USER = { name: 'Abe', id: 'USR-DEMO' };
export const LOT = { id: 'EVE-LAP-00231', name: 'Laptop', weightKg: 1.8, recoveredG: 640, valueRm: 8.4, heldRm: 4.2 };
export const DRIVER = { name: 'Aiman', plate: 'WXY 1234', rating: 4.9, etaStartMin: 8 };

// PLACEHOLDER coordinates near Taylor's Lakeside Campus, Subang Jaya.
export const USER_POS = { lat: 3.0648, lng: 101.6165 };
export const DRIVER_PATH: [number, number][] = [
  [3.0950, 101.6420], [3.0890, 101.6350], [3.0820, 101.6310], [3.0760, 101.6260], [3.0700, 101.6210], [3.0655, 101.6172],
];
export const DOE_DIRECTORY_URL = 'https://ewaste.doe.gov.my/index.php/about/list-of-collectors/';
// Real DOE collection points, copied once from the DOE directory (see DOE_DIRECTORY_URL) into doe-points.json.
// Distances are straight-line from the demo user's PLACEHOLDER position, nearest first.
const rad = Math.PI / 180;
const distKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
export const DOE_POINTS = (doePoints as DoePoint[])
  .map((p) => ({ ...p, area: p.city || p.state, km: Math.round(distKm(USER_POS, p) * 10) / 10 }))
  .sort((a, b) => a.km - b.km);
/** Points shown on the Recycle map. */
export const DOE_NEARBY = DOE_POINTS.filter((p) => p.km <= 40);

export const HISTORY = [
  { id: 'EVE-CHG-00198', name: 'Charger set', note: 'Not started', grams: 800, untracked: true },
  { id: 'EVE-PHN-00112', name: 'Old phone', note: 'Completed 28 Sep', grams: 182, untracked: false },
];

// Fund details are copied from the user's reference table. `simRate` is a PLACEHOLDER used only for the
// accelerated demo-clock P/L simulation, not a forecast.
export const FUNDS = [
  {
    id: 'principal', moreUrl: 'https://www.principal.com.my/en/gsg-myr?field_fund_nav_date_value%5Bmin%5D=29-09-2026&field_fund_nav_date_value%5Bmax%5D=06-10-2026', logo: require('../../assets/logos/principal.png'), name: 'Principal Global Sustainable Growth Fund', category: 'Equity (Global ESG)', unitClass: 'MYR-Hedged',
    nav: 'MYR 1.2848', navDate: 'as of Sept 30, 2026', returns: ['+17.42% (1-Year)', '+39.38% (3-Year)'],
    risk: 'High', min: 10, restricted: false, simRate: 3.0,
    series: [100, 100.4, 100.9, 100.6, 101.3, 101.8, 102.2, 102.1, 102.9, 103.4],
  },
  {
    id: 'bimb', moreUrl: 'https://www.fsmone.com.my/funds/tools/factsheet/bimb-arabesque-asia-pacific-shariah-esg-equity-fund-myr?fund=MYBIAAPSG', logo: require('../../assets/logos/bimb.jpg'), name: 'BIMB-Arabesque Asia Pacific Shariah-ESG Equity Fund', category: 'Equity (Asia Pacific, Shariah-Compliant)', unitClass: 'MYR',
    nav: 'MYR 0.2400', navDate: 'as of Sept 30, 2026', returns: ['+17.12% (2022)', '-6.25% (2023)'],
    risk: 'High', min: 10, restricted: false, simRate: 4.2,
    series: [100, 101.2, 100.1, 102.4, 101.7, 103.5, 102.9, 104.6, 105.2, 104.8],
  },
  {
    id: 'kenanga', logo: require('../../assets/logos/kenanga.jpg'), name: 'Kenanga Sustainability Series: Frontier Fund', category: 'Alternative Investments / Private Equity', unitClass: 'MYR (Closed-end)',
    nav: 'MYR 0.3140', navDate: 'as of Dec 31, 2025', returns: ['Targeted 12% IRR benchmark', '(Sophisticated Investors only)'],
    risk: 'Restricted', min: 0, restricted: true, simRate: 2.5,
    series: [100, 100.2, 100.4, 100.7, 100.9, 101.1, 101.4, 101.6, 101.9, 102.1],
  },
];

export const VOUCHERS = [
  { id: 'v1', title: 'Senheng voucher RM10', cost: 300, expiry: '31 Dec 2026', logo: require('../../assets/logos/senheng.webp') },
  { id: 'v2', title: 'Harvey Norman voucher RM5', cost: 150, expiry: '31 Dec 2026', logo: require('../../assets/logos/harveynorman.jpeg') },
  { id: 'v3', title: 'Transport credit RM8', cost: 240, expiry: '30 Nov 2026', logo: null },
];

// PLACEHOLDER: grams of verified recycled material needed per unlockable, plus a seeded starting amount.
// The "equals about x%" figures are illustrative assumptions only.
export const UNLOCKABLES = [
  { id: 'board', name: 'Motherboard', need: 1000, base: 1000, share: 'about 12% of the copper in a new motherboard' },
  { id: 'phone', name: 'Phone', need: 1000, base: 1000, share: 'about 8% of the material in a new phone' },
  { id: 'laptop', name: 'Laptop', need: 1000, base: 420, share: 'about 5% of the material in a new laptop' },
  { id: 'battery', name: 'Battery', need: 800, base: 150, share: 'about 6% of the cobalt in a new battery' },
  { id: 'oven', name: 'Oven', need: 2500, base: 300, share: 'about 2% of the steel in a new oven' },
  { id: 'coil', name: 'Copper coil', need: 600, base: 210, share: 'about 15% of the copper in a new coil' },
];

export const HOPS_BASE = [
  { hop: 'Box or giver to driver', lots: 40, flagged: 1, flag: 'weight mismatch' },
  { hop: 'Driver to point or recycler', lots: 38, flagged: 6, flag: 'weight mismatch, unlicensed' },
  { hop: 'Recycler to manufacturer', lots: 30, flagged: 0, flag: 'none' },
];
export const ACTORS_BASE = [
  { id: 'COLLECTOR-A', flags: 0 },
  { id: 'COLLECTOR-B', flags: 5 },
];

export const hashFor = (i: number) => ['a3f9c1d2', '7be40d19', '1c88e5fa', 'd02a7b63', '9f41ce08', '5a6d2e71', 'e8130b4c', '3b9f7a25', 'c47d0e96'][i % 9];
