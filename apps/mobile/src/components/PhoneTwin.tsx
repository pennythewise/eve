import React, { useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Rounded-rectangle outline used for the body and the screen glass.
function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export type Drag = { x: number; y: number; active: boolean };

export function Phone({ drag }: { drag: React.MutableRefObject<Drag> }) {
  const group = useRef<THREE.Group>(null);
  const body = useMemo(() => new THREE.ExtrudeGeometry(roundedRect(1.5, 3, 0.22), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4, curveSegments: 16 }), []);
  const glass = useMemo(() => new THREE.ShapeGeometry(roundedRect(1.36, 2.84, 0.16), 16), []);
  const crack = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0.55, 1.3, 0, 0.15, 0.5, 0, 0.15, 0.5, 0, -0.1, -0.2, 0, -0.1, -0.2, 0, -0.45, -0.95, 0, 0.15, 0.5, 0, 0.6, 0.1, 0], 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (!drag.current.active) drag.current.y += dt * 0.6; // idle spin
    g.rotation.y = drag.current.y;
    g.rotation.x = drag.current.x;
  });

  return (
    <group ref={group}>
      <mesh geometry={body} position={[0, 0, -0.07]}>
        <meshStandardMaterial color="#2B3A3A" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh geometry={glass} position={[0, 0, 0.115]}>
        <meshStandardMaterial color="#071A18" metalness={0.2} roughness={0.15} emissive="#0A9C8A" emissiveIntensity={0.18} />
      </mesh>
      <lineSegments geometry={crack} position={[0, 0, 0.12]}>
        <lineBasicMaterial color="#8FD9CF" />
      </lineSegments>
      {/* notch / speaker */}
      <mesh position={[0, 1.34, 0.12]}>
        <capsuleGeometry args={[0.04, 0.3, 4, 12]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* rear camera bump */}
      <mesh position={[-0.4, 1.05, -0.2]}>
        <boxGeometry args={[0.55, 0.55, 0.06]} />
        <meshStandardMaterial color="#1C2828" metalness={0.8} roughness={0.3} />
      </mesh>
      {[[-0.55, 1.18], [-0.27, 1.18], [-0.41, 0.92]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 24]} />
          <meshStandardMaterial color="#0B0F0F" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function PhoneTwin({ height = 380 }: { height?: number }) {
  const drag = useRef<Drag>({ x: 0, y: 0.5, active: false });
  const start = useRef({ x: 0, y: 0 });
  const pan = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { drag.current.active = true; start.current = { x: drag.current.x, y: drag.current.y }; },
      onPanResponderMove: (_, g) => {
        drag.current.y = start.current.y + g.dx * 0.012;
        drag.current.x = Math.max(-0.8, Math.min(0.8, start.current.x + g.dy * 0.008));
      },
      onPanResponderRelease: () => { drag.current.active = false; },
      onPanResponderTerminate: () => { drag.current.active = false; },
    }),
    [],
  );

  return (
    <View style={{ height, borderRadius: 20, overflow: 'hidden', backgroundColor: '#E9F6F3' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-4, -2, -3]} intensity={0.8} color="#7FE3D4" />
        <Phone drag={drag} />
      </Canvas>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} {...pan.panHandlers} />
    </View>
  );
}
