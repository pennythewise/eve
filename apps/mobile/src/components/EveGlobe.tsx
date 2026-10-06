import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { EveDevice } from '../data/eveth';

const R = 1.6;
const BG = '#052F2B';

const toVec = (lat: number, lng: number, r: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

// Fake continents: a sum of sines over the sphere surface decides land vs ocean.
const isLand = (p: THREE.Vector3) =>
  Math.sin(p.x * 2.6 + 1.1) * Math.cos(p.y * 2.2) + Math.sin(p.z * 3.1 + p.x * 1.7) * 0.7 + Math.cos(p.y * 4.3 + p.z * 1.3) * 0.3 > 0.55;

function dots(count: number, radius: number, pick: (p: THREE.Vector3) => THREE.Color | null) {
  const pos: number[] = [], col: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    const unit = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    const c = pick(unit);
    if (!c) continue;
    pos.push(unit.x * radius, unit.y * radius, unit.z * radius);
    col.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

type Drag = { x: number; y: number; active: boolean };
type Picker = { current: ((nx: number, ny: number) => string | null) | null };

function Globe({ devices, selected, drag, picker }: { devices: EveDevice[]; selected: string | null; drag: React.MutableRefObject<Drag>; picker: Picker }) {
  const spin = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Group>(null);
  const markers = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Mesh>(null);
  const rings = useRef<Record<string, THREE.Mesh | null>>({});
  const { camera, raycaster } = useThree();

  const land = useMemo(() => dots(5200, R, (p) => (isLand(p) ? new THREE.Color().setHSL(0.42 + p.y * 0.04, 0.6, 0.55) : null)), []);
  const sea = useMemo(() => dots(2200, R, (p) => (isLand(p) ? null : new THREE.Color('#1E7F75'))), []);
  const mist = useMemo(() => dots(520, R + 0.1, (p) => (Math.sin(p.x * 5 + p.y * 3) * Math.cos(p.z * 4) > 0.25 ? new THREE.Color('#D9F3EE') : null)), []);

  useFrame((state, dt) => {
    const g = spin.current;
    if (!g) return;
    if (!drag.current.active && !selected) drag.current.y += dt * 0.25;
    g.rotation.y = drag.current.y;
    g.rotation.x = drag.current.x;
    if (clouds.current) clouds.current.rotation.y += dt * 0.05;
    const t = state.clock.elapsedTime;
    Object.entries(rings.current).forEach(([id, m]) => {
      if (!m) return;
      const k = 1 + ((t * 0.9 + id.length * 0.13) % 1) * 1.6;
      m.scale.setScalar(k);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - (k - 1) / 1.6);
    });
  });

  useEffect(() => {
    picker.current = (nx, ny) => {
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const targets = [globe.current!, ...(markers.current?.children ?? [])];
      const hit = raycaster.intersectObjects(targets, true)[0];
      let o: THREE.Object3D | null = hit?.object ?? null;
      while (o && !o.userData.id) o = o.parent;
      return (o?.userData.id as string) ?? null;
    };
    return () => { picker.current = null; };
  }, [camera, raycaster, picker]);

  return (
    <group ref={spin}>
      <mesh ref={globe}>
        <sphereGeometry args={[R - 0.015, 48, 48]} />
        <meshBasicMaterial color={BG} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R + 0.22, 48, 48]} />
        <meshBasicMaterial color="#3FD6C2" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      <points geometry={sea}><pointsMaterial size={0.028} vertexColors sizeAttenuation /></points>
      <points geometry={land}><pointsMaterial size={0.045} vertexColors sizeAttenuation /></points>
      <group ref={clouds}>
        <points geometry={mist}><pointsMaterial size={0.06} color="#D9F3EE" transparent opacity={0.35} sizeAttenuation /></points>
      </group>
      <group ref={markers}>
        {devices.map((d) => {
          const p = toVec(d.lat, d.lng, R + 0.02);
          const on = d.id === selected;
          return (
            <group key={d.id} userData={{ id: d.id }} position={p} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize())}>
              <mesh><sphereGeometry args={[on ? 0.085 : 0.06, 16, 16]} /><meshBasicMaterial color={d.color} /></mesh>
              <mesh position={[0, 0, 0.005]} ref={(m) => { rings.current[d.id] = m; }}>
                <ringGeometry args={[0.07, 0.09, 32]} /><meshBasicMaterial color={d.color} transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
              {/* invisible, larger hit area so thumbs can hit it */}
              <mesh><sphereGeometry args={[0.16, 8, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export function EveGlobe({ devices, selected, onSelect, height = 380 }: { devices: EveDevice[]; selected: string | null; onSelect: (id: string | null) => void; height?: number }) {
  const drag = useRef<Drag>({ x: 0.3, y: -0.3, active: false });
  const start = useRef({ x: 0, y: 0 });
  const picker: Picker = useRef(null);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const pan = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { drag.current.active = true; start.current = { x: drag.current.x, y: drag.current.y }; },
      onPanResponderMove: (_, g) => {
        drag.current.y = start.current.y + g.dx * 0.012;
        drag.current.x = Math.max(-1, Math.min(1, start.current.x + g.dy * 0.008));
      },
      onPanResponderRelease: (e, g) => {
        drag.current.active = false;
        if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) {
          const { w, h } = sizeRef.current;
          const { locationX, locationY } = e.nativeEvent;
          onSelectRef.current(picker.current?.((locationX / w) * 2 - 1, -(locationY / h) * 2 + 1) ?? null);
        }
      },
      onPanResponderTerminate: () => { drag.current.active = false; },
    }),
    [],
  );

  return (
    <View style={{ height, borderRadius: 20, overflow: 'hidden', backgroundColor: BG }} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Canvas camera={{ position: [0, 0, 5.4], fov: 40 }}>
        <Globe devices={devices} selected={selected} drag={drag} picker={picker} />
      </Canvas>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} {...pan.panHandlers} />
    </View>
  );
}
