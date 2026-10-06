import React, { useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Phone, type Drag } from './PhoneTwin';

type D = { drag: React.MutableRefObject<Drag> };

function Spin({ drag, children, tilt = 0 }: D & { children: React.ReactNode; tilt?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    if (!drag.current.active) drag.current.y += dt * 0.6;
    g.current.rotation.y = drag.current.y;
    g.current.rotation.x = drag.current.x + tilt;
  });
  return <group ref={g}>{children}</group>;
}

const Box = ({ s, p, c, m = 0.2, r = 0.5 }: { s: [number, number, number]; p?: [number, number, number]; c: string; m?: number; r?: number }) => (
  <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial color={c} metalness={m} roughness={r} /></mesh>
);

// Invented hackathon-style stickers (no real brands), drawn once onto canvases. Needs a DOM canvas, so
// on native (no document) the laptop falls back to plain coloured stickers.
const DESIGNS: { top: string; main: string; bottom: string; bg: string; bg2: string; fg: string; shape: 'round' | 'rect' | 'hex' | 'shield' }[] = [
  { top: 'HACK', main: '2023', bottom: '48 HOURS', bg: '#FFB300', bg2: '#FF5E3A', fg: '#1B1B1B', shape: 'round' },
  { top: '', main: 'SHIP IT', bottom: '🚀', bg: '#3A1C9E', bg2: '#E01EA0', fg: '#FFE45E', shape: 'rect' },
  { top: 'DEMO', main: 'DAY', bottom: 'WINNER', bg: '#FF3D6E', bg2: '#FF9A3D', fg: '#fff', shape: 'shield' },
  { top: '', main: '</>', bottom: 'code more', bg: '#00C2A8', bg2: '#0077FF', fg: '#fff', shape: 'rect' },
  { top: 'NO', main: 'SLEEP', bottom: 'CLUB', bg: '#7B2FF7', bg2: '#00D4FF', fg: '#fff', shape: 'hex' },
  { top: 'AI', main: 'HACK', bottom: 'WEEKEND', bg: '#00E5A0', bg2: '#00A3FF', fg: '#04293A', shape: 'round' },
  { top: '', main: '404', bottom: 'sleep not found', bg: '#FFF176', bg2: '#FF8A65', fg: '#C2185B', shape: 'rect' },
  { top: 'BUILD', main: '☕', bottom: 'BREAK', bg: '#FF8F00', bg2: '#E53935', fg: '#FFF3DC', shape: 'hex' },
  { top: 'MERGED', main: '✔', bottom: 'to main', bg: '#76FF03', bg2: '#00C853', fg: '#073B1C', shape: 'round' },
  { top: 'HELLO', main: 'WORLD', bottom: 'finalist', bg: '#40C4FF', bg2: '#536DFE', fg: '#fff', shape: 'shield' },
  { top: 'TEAM', main: '🔥', bottom: 'DEMO GODS', bg: '#FF4081', bg2: '#AA00FF', fg: '#fff', shape: 'round' },
  { top: '', main: 'git push', bottom: '--force', bg: '#FFEB3B', bg2: '#FF9800', fg: '#222', shape: 'rect' },
];

function stickerTexture(d: (typeof DESIGNS)[number]) {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const path = (inset: number) => {
    const m = S / 2, r = m - inset;
    g.beginPath();
    if (d.shape === 'round') g.arc(m, m, r, 0, Math.PI * 2);
    else if (d.shape === 'hex') for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i + Math.PI / 6; g[i ? 'lineTo' : 'moveTo'](m + r * Math.cos(a), m + r * Math.sin(a)); }
    else if (d.shape === 'shield') { g.moveTo(inset, inset + 20); g.lineTo(S - inset, inset + 20); g.lineTo(S - inset, S * 0.55); g.quadraticCurveTo(m, S - inset + 30, inset, S * 0.55); g.closePath(); }
    else g.roundRect(inset, inset + 30, S - inset * 2, S - inset * 2 - 60, 28);
  };
  path(6); g.fillStyle = '#fff'; g.fill();        // die-cut white border
  path(20);
  const gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, d.bg); gr.addColorStop(1, d.bg2);
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();                               // confetti dots and a diagonal stripe, clipped to the sticker
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(-20, S * 0.62, S + 40, 16);
  for (let k = 0; k < 14; k++) { g.beginPath(); g.arc(((k * 71) % S), ((k * 113) % S), 5 + (k % 3) * 3, 0, Math.PI * 2); g.fillStyle = k % 2 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.12)'; g.fill(); }
  g.restore();
  g.fillStyle = d.fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '700 34px Inter, Arial, sans-serif'; g.fillText(d.top, S / 2, 78);
  g.font = `800 ${d.main.length > 4 ? 48 : 72}px Inter, Arial, sans-serif`; g.fillText(d.main, S / 2, 128);
  g.font = '600 26px Inter, Arial, sans-serif'; g.fillText(d.bottom, S / 2, 188);
  g.globalAlpha = 0.12; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(S * 0.35, S * 0.25, S * 0.3, S * 0.1, -0.5, 0, Math.PI * 2); g.fill(); // glossy highlight
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function Laptop({ drag }: D) {
  // 6 x 4 grid with jitter so stickers sit side by side like a real lid, each at a hair-different depth.
  const stickers = useMemo(() => {
    const canvasOk = typeof document !== 'undefined';
    return Array.from({ length: 24 }, (_, i) => {
      const col = i % 6, row = Math.floor(i / 6), j = (n: number) => (((i * n) % 17) / 17 - 0.5);
      const d = DESIGNS[(i * 5) % DESIGNS.length];
      return {
        x: -0.85 + col * 0.34 + j(7) * 0.08, y: 0.22 + row * 0.32 + j(11) * 0.06, size: 0.34 + (((i * 3) % 4) * 0.03),
        rot: j(13) * 0.6, z: -0.032 - i * 0.0012, map: canvasOk ? stickerTexture(d) : null, color: d.bg,
      };
    });
  }, []);
  return (
    <Spin drag={drag} tilt={0.15}>
      <group position={[0, -0.5, 0]}>
        <Box s={[2.2, 0.1, 1.5]} c="#C3CBCB" m={0.3} r={0.4} />
        <Box s={[1.8, 0.02, 0.9]} p={[0, 0.06, -0.1]} c="#2B3A3A" />
        <group position={[0, 0.05, -0.75]} rotation={[-0.35, 0, 0]}>
          <Box s={[2.2, 1.4, 0.06]} p={[0, 0.7, 0]} c="#C3CBCB" m={0.3} r={0.4} />
          <Box s={[2.0, 1.22, 0.01]} p={[0, 0.7, 0.035]} c="#071A18" />
          {stickers.map((s, i) => (
            <mesh key={i} position={[-s.x, s.y, s.z]} rotation={[0, Math.PI, s.rot]}>
              <planeGeometry args={[s.size, s.size]} />
              {s.map
                ? <meshStandardMaterial map={s.map} transparent alphaTest={0.4} roughness={0.35} />
                : <meshStandardMaterial color={s.color} roughness={0.35} />}
            </mesh>
          ))}
        </group>
      </group>
    </Spin>
  );
}

function Fridge({ drag }: D) {
  return (
    <Spin drag={drag}>
      <Box s={[1.2, 2.5, 1.1]} c="#D6E8F5" m={0.4} r={0.3} />
      <Box s={[1.18, 0.02, 0.02]} p={[0, 0.45, 0.56]} c="#6C8AA3" />
      <Box s={[0.05, 0.8, 0.07]} p={[0.45, 0.9, 0.6]} c="#8C99A3" m={0.9} />
      <Box s={[0.05, 0.5, 0.07]} p={[0.45, -0.1, 0.6]} c="#8C99A3" m={0.9} />
      {['#E8A317', '#E86A4F', '#1FAF6B', '#4FA3E8'].map((c, i) => <Box key={c} s={[0.16, 0.16, 0.03]} p={[-0.3 + (i % 2) * 0.25, 0.95 - Math.floor(i / 2) * 0.25, 0.57]} c={c} />)}
    </Spin>
  );
}

function Oven({ drag }: D) {
  return (
    <Spin drag={drag} tilt={0.1}>
      <Box s={[2, 1.6, 1.4]} c="#B8C2C2" m={0.8} r={0.3} />
      <Box s={[1.5, 0.9, 0.02]} p={[0, -0.15, 0.71]} c="#1A1F1F" />
      <Box s={[1.6, 0.06, 0.08]} p={[0, 0.4, 0.76]} c="#7C8888" m={0.9} />
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.62, 0.72]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.1, 20]} /><meshStandardMaterial color="#2B3A3A" metalness={0.7} /></mesh>
      ))}
    </Spin>
  );
}

function Board({ drag }: D) {
  const chips: [number, number, number, number, string][] = [[-0.5, 0.4, 0.5, 0.5, '#1C2828'], [0.5, 0.5, 0.35, 0.35, '#2B3A3A'], [0.4, -0.45, 0.6, 0.25, '#1C2828'], [-0.6, -0.5, 0.3, 0.3, '#C9A227']];
  return (
    <Spin drag={drag} tilt={-0.7}>
      <Box s={[2.2, 2.2, 0.08]} c="#0F7A4F" m={0.3} r={0.5} />
      {chips.map(([x, y, w, h, c], i) => <Box key={i} s={[w, h, 0.12]} p={[x, y, 0.1]} c={c} m={0.7} />)}
      {[-0.9, -0.75, -0.6].map((x) => <Box key={x} s={[0.08, 0.5, 0.2]} p={[x, 0, 0.12]} c="#C9A227" m={0.9} />)}
    </Spin>
  );
}

function Headphones({ drag }: D) {
  const metal = { color: '#D5DADF', metalness: 0.55, roughness: 0.28 } as const;
  return (
    <Spin drag={drag} tilt={0.1}>
      <group position={[0, -0.3, 0]}>
        {/* steel headband with a soft mesh canopy underneath */}
        <mesh scale={[1, 1, 2.4]}><torusGeometry args={[1.05, 0.055, 16, 48, Math.PI]} /><meshStandardMaterial {...metal} /></mesh>
        <mesh position={[0, -0.02, 0]} scale={[1, 1, 3.2]}><torusGeometry args={[1.02, 0.035, 12, 48, Math.PI]} /><meshStandardMaterial color="#6B7279" roughness={0.9} /></mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 1.05, 0, 0]}>
            {/* yoke arm joining band to cup */}
            <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.035, 0.035, 0.4, 12]} /><meshStandardMaterial {...metal} /></mesh>
            {/* rounded ear cup */}
            <mesh position={[side * 0.06, -0.62, 0]} scale={[0.3, 0.55, 0.46]}><sphereGeometry args={[1, 40, 32]} /><meshStandardMaterial {...metal} /></mesh>
            {/* outer cap ring */}
            <mesh position={[side * 0.3, -0.62, 0]} rotation={[0, Math.PI / 2, 0]} scale={[0.82, 1.3, 1]}><torusGeometry args={[0.3, 0.02, 12, 40]} /><meshStandardMaterial color="#AEB5BB" metalness={0.7} roughness={0.25} /></mesh>
            {/* memory-foam cushion facing the head */}
            <mesh position={[-side * 0.2, -0.62, 0]} scale={[0.17, 0.5, 0.4]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color="#8A929A" roughness={0.95} /></mesh>
          </group>
        ))}
      </group>
    </Spin>
  );
}

function Model({ id, drag }: { id: string } & D) {
  if (id.includes('LAP')) return <Laptop drag={drag} />;
  if (id.includes('FRG')) return <Fridge drag={drag} />;
  if (id.includes('OVN')) return <Oven drag={drag} />;
  if (id.includes('MBD')) return <Board drag={drag} />;
  if (id.includes('HDP')) return <Headphones drag={drag} />;
  return <Phone drag={drag} />;
}

export function DeviceTwin3D({ id, height = 260, bg = '#E9F6F3' }: { id: string; height?: number; bg?: string }) {
  const drag = useRef<Drag>({ x: 0, y: 0.5, active: false });
  const start = useRef({ x: 0, y: 0 });
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { drag.current.active = true; start.current = { x: drag.current.x, y: drag.current.y }; },
    onPanResponderMove: (_, g) => {
      drag.current.y = start.current.y + g.dx * 0.012;
      drag.current.x = Math.max(-0.8, Math.min(0.8, start.current.x + g.dy * 0.008));
    },
    onPanResponderRelease: () => { drag.current.active = false; },
    onPanResponderTerminate: () => { drag.current.active = false; },
  }), []);
  return (
    <View style={{ height, borderRadius: 20, overflow: 'hidden', backgroundColor: bg }}>
      <Canvas key={id} camera={{ position: [0, 0, 6.5], fov: 40 }}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-4, -2, -3]} intensity={0.8} color="#7FE3D4" />
        <Model id={id} drag={drag} />
      </Canvas>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} {...pan.panHandlers} />
    </View>
  );
}
