import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { INITIAL_DEMO_STATE, type DemoState } from '@eve/shared';
import { DRIVER, FUNDS, LOT } from '../data/demo';
import { Toast } from '../components';

// The app finds the server from the Expo host (strip the port, use 4000). Override with EXPO_PUBLIC_API_URL.
function apiBase() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `http://${window.location.hostname}:4000`;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:4000`;
}
export const API = apiBase();

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(API + path, body === undefined ? undefined : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}

const STAGE_TOAST: Record<number, string> = {
  1: `Item registered. RM ${LOT.heldRm.toFixed(2)} held until delivery`,
  2: 'Pickup requested. Looking for a driver',
  3: `Driver ${DRIVER.name} accepted your pickup, ETA ${DRIVER.etaStartMin} min`,
  4: `Driver ${DRIVER.name} is on the way`,
  5: 'Picked up, confirmed by both sides',
  6: 'Item reached the collection point',
  7: `RM ${LOT.heldRm.toFixed(2)} released to your wallet`,
  8: `Material recovered: ${LOT.recoveredG} g`,
  9: 'Received by manufacturer. Lot complete',
};

interface Ctx {
  state: DemoState;
  connected: boolean;
  /** ms since the current stage began on this phone; drives the ETA countdown and driver marker. */
  stageAge: number;
  toast: (msg: string) => void;
  api: { register: () => Promise<void>; requestPickup: () => Promise<void>; scan: (payload: string) => Promise<{ kind: string; bothSides?: boolean }> };
  wallet: { available: number; held: number; invested: number; points: number; underReview: boolean; plPct: number; pl: number; holdings: { fundId: string; principal: number; pl: number }[] };
  invest: (fundId: string, n: number) => boolean;
  withdraw: (fundId: string, n: number) => void;
  spendPoints: (n: number) => void;
  /** Mock grams for the report. */
  flags: { weight: boolean; unlicensed: boolean; tamper: boolean };
}

const DemoContext = createContext<Ctx>(null as unknown as Ctx);
export const useDemo = () => useContext(DemoContext);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE);
  const [connected, setConnected] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [stageSince, setStageSince] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [holdings, setHoldings] = useState<Record<string, number>>({ principal: 20 });
  const [spent, setSpent] = useState(0);
  const [startedAt] = useState(Date.now());
  const prev = useRef<DemoState>(INITIAL_DEMO_STATE);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3000);
  }, []);

  const apply = useCallback((s: DemoState) => {
    const p = prev.current;
    if (s.stage !== p.stage) {
      setStageSince(Date.now());
      if (s.stage > p.stage) {
        const flagged = s.stage === 7 && s.unlicensedRecycler;
        toast(flagged ? 'Flag raised: unlicensed recycler. Credit under review' : STAGE_TOAST[s.stage] ?? '');
      } else toast(s.stage === 0 ? 'Demo reset' : 'Stepped back');
    } else {
      if (s.weightShortfall && !p.weightShortfall && s.stage >= 6) toast('Flag raised: weight mismatch');
      if (s.unlicensedRecycler && !p.unlicensedRecycler && s.stage >= 7) toast('Flag raised: unlicensed recycler');
      if (s.tamper && !p.tamper) toast('Chain broken at event #3');
    }
    if (s.stage === 5 && !p.handoverSigned && s.handoverSigned) toast('Confirmed by both sides');
    prev.current = s;
    setState(s);
  }, [toast]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const s = await call<DemoState>('/api/state');
        if (!alive) return;
        setConnected(true);
        apply(s);
      } catch {
        if (alive) setConnected(false);
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => { alive = false; clearInterval(id); clearInterval(tick); };
  }, [apply]);

  const api = useMemo<Ctx['api']>(() => ({
    register: async () => { try { apply(await call<DemoState>('/api/register', {})); } catch { toast('Server offline'); } },
    requestPickup: async () => { try { apply(await call<DemoState>('/api/pickup', {})); } catch { toast('Server offline'); } },
    scan: async (payload) => {
      try {
        const r = await call<{ kind: string; bothSides?: boolean; state: DemoState }>('/api/scan', { payload });
        apply(r.state);
        return r;
      } catch { toast('Server offline'); return { kind: 'error' }; }
    },
  }), [apply, toast]);

  const wallet = useMemo<Ctx['wallet']>(() => {
    const s = state.stage;
    const flagged = state.unlicensedRecycler || state.weightShortfall;
    const underReview = s >= 7 && flagged;
    const released = s >= 7 && !flagged;
    const mins = (now - startedAt) / 60000; // demo clock, PLACEHOLDER acceleration so judges can watch P/L move
    const rows = FUNDS.map((f) => {
      const principal = holdings[f.id] ?? 0;
      return { fundId: f.id, principal, pl: (principal * f.simRate * (1 + mins * 0.1)) / 100 };
    }).filter((r) => r.principal > 0);
    const invested = rows.reduce((n, r) => n + r.principal, 0);
    const pl = rows.reduce((n, r) => n + r.pl, 0);
    return {
      available: 38.5 + (released ? LOT.heldRm : 0) - (invested - 20),
      held: s >= 1 && !released ? LOT.heldRm : 0,
      invested,
      points: 380 + (released ? 42 : 0) - spent,
      underReview,
      pl,
      plPct: invested ? (pl / invested) * 100 : 0,
      holdings: rows,
    };
  }, [state, holdings, spent, now, startedAt]);

  const value = useMemo<Ctx>(() => ({
    state, connected, stageAge: Math.max(0, now - stageSince), toast, api, wallet,
    invest: (fundId, n) => {
      if (wallet.available < n) { toast('Not enough available balance'); return false; }
      setHoldings((h) => ({ ...h, [fundId]: (h[fundId] ?? 0) + n }));
      toast(`Invested RM ${n.toFixed(2)} (simulated)`);
      return true;
    },
    withdraw: (fundId, n) => setHoldings((h) => ({ ...h, [fundId]: Math.max(0, (h[fundId] ?? 0) - n) })),
    spendPoints: (n) => setSpent((v) => v + n),
    flags: { weight: state.weightShortfall && state.stage >= 6, unlicensed: state.unlicensedRecycler && state.stage >= 7, tamper: state.tamper },
  }), [state, connected, now, stageSince, toast, api, wallet]);

  return (
    <DemoContext.Provider value={value}>
      {children}
      <Toast message={msg ?? ''} visible={!!msg} />
    </DemoContext.Provider>
  );
}
