import React, { useEffect, useRef, useState } from 'react';
import { Image, Linking, Platform, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { Card, Chip, PrimaryButton, ProgressBar, SecondaryButton } from '../components';
import { useDemo } from '../state/DemoProvider';
import { LOT } from '../data/demo';
import { colors, fonts, type } from '../theme';

const SIDES = ['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'] as const;
const TYPES = ['Laptop', 'Phone', 'Tablet', 'Monitor'];
const outline: Record<string, { w: number; h: number }> = {
  Front: { w: 200, h: 140 }, Back: { w: 200, h: 140 }, Left: { w: 200, h: 24 }, Right: { w: 200, h: 24 }, Top: { w: 200, h: 150 }, Bottom: { w: 200, h: 150 },
};

export function DeviceCheck({ onCreated }: { onCreated: () => void }) {
  const { api } = useDemo();
  const [perm, ask] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const asked = useRef(false);

  // Ask for the camera as soon as Device check opens, once, so the live preview starts without an extra tap.
  useEffect(() => {
    if (perm && !perm.granted && perm.canAskAgain && !asked.current) {
      asked.current = true;
      ask();
    }
  }, [perm, ask]);
  const [shots, setShots] = useState<(string | null)[]>([]);
  const [phase, setPhase] = useState<'capture' | 'checking' | 'result'>('capture');
  const [pct, setPct] = useState(0);
  const [dtype, setDtype] = useState(LOT.name);
  const idx = shots.length;
  const side = SIDES[Math.min(idx, 5)];

  const take = async () => {
    let uri: string | null = null;
    try { uri = (await cam.current?.takePictureAsync({ quality: 0.3 }))?.uri ?? null; } catch {}
    setShots((s) => [...s, uri]);
  };
  const retake = (i: number) => setShots((s) => s.slice(0, i));

  useEffect(() => {
    if (phase !== 'checking') return;
    setPct(0);
    const id = setInterval(() => setPct((p) => (p >= 1 ? 1 : p + 0.05)), 100); // fake 2-second review
    const done = setTimeout(() => setPhase('result'), 2100);
    return () => { clearInterval(id); clearTimeout(done); };
  }, [phase]);

  if (phase === 'checking') {
    return (
      <Card large style={{ gap: 14, alignItems: 'center', paddingVertical: 36 }}>
        <Feather name="search" size={34} color={colors.primary} />
        <Text style={type.section}>Reviewing images</Text>
        <View style={{ width: '100%' }}><ProgressBar value={pct} /></View>
        <Text style={type.caption}>Checking {shots.length} sides</Text>
      </Card>
    );
  }

  if (phase === 'result') {
    return (
      <Card large style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={type.section}>Device check result</Text>
          <Chip label="Estimate" tone="warning" />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TYPES.map((t) => (
            <Pressable key={t} onPress={() => setDtype(t)} style={{ paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: 999, backgroundColor: dtype === t ? colors.primary : colors.background, borderWidth: 1, borderColor: dtype === t ? colors.primary : colors.border }}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: dtype === t ? '#fff' : colors.text }}>{t}</Text>
            </Pressable>
          ))}
        </View>
        {[['Condition', 'Working'], ['Estimated weight', `${(LOT.weightKg * 1000).toLocaleString()} g`], ['Recoverable value', `RM ${LOT.valueRm.toFixed(2)} to RM 12.60`]].map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={type.caption}>{k}</Text><Text style={type.cardTitle}>{v}</Text>
          </View>
        ))}
        <View style={{ backgroundColor: '#F9E0E0', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Feather name="alert-triangle" size={18} color={colors.danger} />
          <Text style={[type.body, { color: colors.danger, flex: 1, fontSize: 13 }]}>Contains battery, keep upright and separate.</Text>
        </View>
        <Text style={type.caption}>Estimate only.</Text>
        <PrimaryButton label="Create item passport" icon="file-plus" onPress={async () => { await api.register(); onCreated(); }} />
      </Card>
    );
  }

  const allDone = shots.length === 6;
  const o = outline[side];
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={type.section}>{allDone ? 'All six sides captured' : `${side} · ${idx + 1} of 6`}</Text>
        <Chip label={`${shots.length} of 6`} tone={allDone ? 'success' : 'primary'} />
      </View>
      {!allDone ? (
        <View style={{ height: 260, borderRadius: 20, overflow: 'hidden', backgroundColor: '#0B2B28', alignItems: 'center', justifyContent: 'center' }}>
          {perm?.granted ? <CameraView ref={cam} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back" /> : (
            <View style={{ alignItems: 'center', gap: 10, padding: 16 }}>
              <Feather name="camera-off" size={28} color="#9FD9D0" />
              <Text style={[type.body, { color: '#fff', textAlign: 'center', fontSize: 13 }]}>
                {perm ? 'Camera access is blocked. Allow it to take photos, or capture with sample images.' : 'Opening camera...'}
              </Text>
              {perm ? <SecondaryButton label={perm.canAskAgain || Platform.OS === 'web' ? 'Allow camera' : 'Open settings'} onPress={perm.canAskAgain || Platform.OS === 'web' ? ask : () => Linking.openSettings()} /> : null}
            </View>
          )}
          {perm?.granted ? (
            <>
              <View style={{ width: o.w, height: o.h, borderRadius: 16, borderWidth: 2.5, borderColor: '#fff', borderStyle: 'dashed' }} />
              <Text style={{ position: 'absolute', bottom: 10, color: '#fff', fontFamily: fonts.semibold, fontSize: 13 }}>Line up the {side.toLowerCase()} of the device</Text>
            </>
          ) : null}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {SIDES.map((s, i) => (
          <Pressable key={s} onPress={() => i < shots.length && retake(i)} style={{ flex: 1, aspectRatio: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: i < shots.length ? colors.primarySoft : colors.border, alignItems: 'center', justifyContent: 'center', borderWidth: i === idx ? 2 : 0, borderColor: colors.primary }}>
            {shots[i] ? <Image source={{ uri: shots[i]! }} style={{ width: '100%', height: '100%' }} /> : i < shots.length ? <Feather name="check" size={16} color={colors.primary} /> : <Text style={type.caption}>{s[0]}</Text>}
          </Pressable>
        ))}
      </View>
      <Text style={[type.caption, { textAlign: 'center', opacity: shots.length > 0 ? 1 : 0 }]}>Tap a thumbnail to retake from that side</Text>
      {allDone ? <PrimaryButton label="Check device" icon="search" onPress={() => setPhase('checking')} />
        : <View style={{ gap: 8 }}>
          <PrimaryButton label={`Capture ${side.toLowerCase()}`} icon="camera" onPress={take} />
          {!perm?.granted ? <SecondaryButton label="Use sample photo" onPress={() => setShots((s) => [...s, null])} /> : null}
        </View>}
    </View>
  );
}
