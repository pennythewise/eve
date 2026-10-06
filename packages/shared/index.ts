export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface DemoState {
  stage: Stage;
  weightShortfall: boolean;
  unlicensedRecycler: boolean;
  tamper: boolean;
  /** Set when the phone scans the driver QR; cleared if the demo is stepped back before pickup. */
  handoverSigned: boolean;
}

export const INITIAL_DEMO_STATE: DemoState = {
  stage: 0,
  weightShortfall: false,
  unlicensedRecycler: false,
  tamper: false,
  handoverSigned: false,
};

export const STAGE_LABELS: Record<Stage, string> = {
  0: 'Fresh start',
  1: 'Item registered',
  2: 'Pickup requested',
  3: 'Driver assigned',
  4: 'On the way',
  5: 'Picked up',
  6: 'At DOE collection point',
  7: 'At licensed recycler',
  8: 'Material recovered',
  9: 'Received by manufacturer',
};

export type ToggleKey = 'weightShortfall' | 'unlicensedRecycler' | 'tamper';

// PLACEHOLDER: QR payloads shown on /sim and accepted by Scan QR.
export const QR_PAYLOADS = [
  { label: 'Driver Aiman', payload: 'eve:driver:AIMAN' },
  { label: 'Collection point (nearest)', payload: 'eve:point:DOE-NEAREST' },
  { label: 'Collection point (2nd nearest)', payload: 'eve:point:DOE-SECOND' },
];
