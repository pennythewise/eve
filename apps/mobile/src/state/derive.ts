import { useMemo } from 'react';
import type { DemoState } from '@eve/shared';
import { ACTORS_BASE, DOE_POINTS, DRIVER, HOPS_BASE, LOT, hashFor } from '../data/demo';
import type { Step } from '../components';

const THRESH = [1, 3, 4, 5, 6, 7, 8, 9, 9];
const TITLES = ['Registered', 'Driver assigned', 'On the way', 'Picked up', 'At collection point', 'At licensed recycler', 'Material recovered', 'Received by manufacturer', 'Complete'];

export function buildSteps(state: DemoState | 'complete'): Step[] {
  const done = state === 'complete';
  const st = done ? ({ stage: 9, weightShortfall: false, unlicensedRecycler: false, tamper: false } as DemoState) : state;
  const weight = !done && st.weightShortfall && st.stage >= 6;
  const unlic = !done && st.unlicensedRecycler && st.stage >= 7;
  let currentSet = false;
  return TITLES.map((title, i) => {
    const isDone = st.stage >= THRESH[i];
    let state2: Step['state'] = isDone ? 'done' : 'pending';
    if (!isDone && !currentSet) { state2 = 'current'; currentSet = true; }
    const meta = [
      'Today 10:02 · You',
      `Driver ${DRIVER.name} · ${DRIVER.plate}`,
      'ETA counting down',
      st.handoverSigned || st.stage >= 5 ? 'Confirmed by both sides' : 'Waiting for handover',
      `${DOE_POINTS[0].name} · ${DOE_POINTS[0].area}`,
      unlic ? 'Recycler (UNLICENSED)' : 'Recycler (licensed) · Shah Alam',
      `${LOT.recoveredG} g recovered`,
      'Manufacturer (demo) · Port Klang',
      'Chain complete',
    ][i];
    const step: Step = { title: unlic && i === 5 ? 'At recycler (unlicensed)' : title, meta: isDone || state2 === 'current' ? meta : undefined, state: state2 };
    if (isDone && i < 8) step.hash = hashFor(i);
    if (weight && i === 4) { step.flag = 'WEIGHT_MISMATCH'; step.flagNote = 'Received weight is more than 5% below the declared weight.'; }
    if (unlic && i === 5) { step.flag = 'UNLICENSED_RECEIVER'; step.flagNote = 'The receiving recycler has no licence on record.'; }
    if (!done && st.tamper && i === 2) { step.highlight = true; step.hash = hashFor(2); step.state = 'done'; step.meta = 'Record changed after signing'; }
    return step;
  });
}

export function statusLabel(s: DemoState) {
  return ['', 'Registered', 'Pickup requested', 'Driver assigned', 'In transit', 'In transit', 'At collection point', 'At recycler', 'Material recovered', 'Complete'][s.stage];
}

/** Item node reached on the route map: home 0, DOE point 1, recycler 2, manufacturer 3. */
export const reachedFor = (stage: number) => (stage >= 9 ? 3 : stage >= 7 ? 2 : stage >= 6 ? 1 : 0);

export function useAudit(s: DemoState) {
  return useMemo(() => {
    const weight = s.weightShortfall && s.stage >= 6;
    const unlic = s.unlicensedRecycler && s.stage >= 7;
    const hops = HOPS_BASE.map((h) => ({ ...h }));
    if (s.stage >= 5) hops[0].lots += 1;
    if (s.stage >= 6) hops[1].lots += 1;
    if (s.stage >= 9) hops[2].lots += 1;
    if (weight) hops[1].flagged += 1;
    if (unlic) hops[1].flagged += 1;
    const worst = hops.reduce((m, h, i) => (h.flagged > hops[m].flagged ? i : m), 0);
    const actors = ACTORS_BASE.map((a) => ({ ...a, lots: a.id === 'COLLECTOR-B' ? ['EVE-LOT-00140', 'EVE-LOT-00152'] : [] as string[] }));
    if (weight) { actors[1].flags += 1; actors[1].lots.push(LOT.id); }
    if (unlic) actors.push({ id: 'RECYCLER-ILLEGAL', flags: 1, lots: [LOT.id] });
    const topActor = actors.reduce((m, a) => (a.flags > m.flags ? a : m), actors[0]).id;
    const liveItems = s.stage >= 1 ? 1 : 0;
    return { hops, worst, actors, topActor, totalLots: 40 + liveItems, flagged: hops.reduce((n, h) => n + h.flagged, 0), chainOk: !s.tamper };
  }, [s]);
}
