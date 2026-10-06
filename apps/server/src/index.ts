import express from 'express';
import cors from 'cors';
import os from 'node:os';
import { INITIAL_DEMO_STATE, type DemoState, type Stage, type ToggleKey } from '@eve/shared';
import { simPage } from './sim.js';

// Single shared object every phone tab renders from. No database, no persistence.
let demoState: DemoState = { ...INITIAL_DEMO_STATE };
const setStage = (n: number) => {
  demoState.stage = Math.max(0, Math.min(9, n)) as Stage;
  if (demoState.stage < 5) demoState.handoverSigned = false;
};

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/state', (_req, res) => res.json(demoState));

app.post('/api/sim/next', (_req, res) => { setStage(demoState.stage + 1); res.json(demoState); });
app.post('/api/sim/back', (_req, res) => { setStage(demoState.stage - 1); res.json(demoState); });
app.post('/api/sim/reset', (_req, res) => { demoState = { ...INITIAL_DEMO_STATE }; res.json(demoState); });
app.post('/api/sim/toggle', (req, res) => {
  const key = req.body?.key as ToggleKey;
  if (!['weightShortfall', 'unlicensedRecycler', 'tamper'].includes(key)) return res.status(400).json({ error: 'bad toggle' });
  demoState[key] = !demoState[key];
  res.json(demoState);
});

// Phone-initiated steps (the citizen's own actions).
app.post('/api/register', (_req, res) => { if (demoState.stage === 0) setStage(1); res.json(demoState); });
app.post('/api/pickup', (_req, res) => { if (demoState.stage <= 1) setStage(2); res.json(demoState); });

// Demo mode accepts any QR; the payload decides what the result card says.
app.post('/api/scan', (req, res) => {
  const payload = String(req.body?.payload ?? '');
  if (!payload) return res.status(400).json({ error: 'empty payload' });
  if (payload.startsWith('eve:point:')) return res.json({ kind: 'point', payload, state: demoState });
  if (payload.startsWith('eve:lot:')) return res.json({ kind: 'lot', payload, state: demoState });
  demoState.handoverSigned = true;
  res.json({ kind: 'driver', payload, bothSides: demoState.stage >= 5, state: demoState });
});

app.get('/sim', (_req, res) => res.type('html').send(simPage));
app.get('/', (_req, res) => res.redirect('/sim'));

app.listen(4000, '0.0.0.0', () => {
  const lan = Object.values(os.networkInterfaces()).flat().find((i) => i && i.family === 'IPv4' && !i.internal)?.address ?? 'localhost';
  console.log(`EVE server  http://${lan}:4000\nController  http://${lan}:4000/sim`);
});
