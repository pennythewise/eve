import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppBar } from '../../src/components/AppBar';
import { Card, Chip, EmptyState, PrimaryButton, ProgressBar, Screen, SectionHeader, SecondaryButton, SegmentedControl, SkeletonRow } from '../../src/components';
import { MapFrame } from '../../src/components/MapFrame';
import { recycleMapHtml } from '../../src/components/recycleMapHtml';
import { useDemo } from '../../src/state/DemoProvider';
import { DOE_DIRECTORY_URL, DOE_POINTS, DRIVER, DRIVER_PATH, LOT, USER } from '../../src/data/demo';
import { colors, type } from '../../src/theme';

const STEPS = ['Requested', 'Assigned', 'On the way', 'Picked up'];
const WINDOWS = ['Now', 'This afternoon', 'Tomorrow morning'];

function driverPos(stage: number, ageMs: number) {
  if (stage < 3 || stage > 5) return null;
  const last = DRIVER_PATH.length - 1;
  const p = stage === 3 ? 0 : stage === 4 ? Math.min(1, Math.max(0, ageMs) / 45000) * last : last;
  const i = Math.min(last - 1, Math.floor(p));
  const f = p - i;
  const [a, b] = [DRIVER_PATH[i], DRIVER_PATH[i + 1]];
  return { lat: a[0] + (b[0] - a[0]) * f, lng: a[1] + (b[1] - a[1]) * f, progress: p / last };
}

export default function Recycle() {
  const { state, stageAge, api } = useDemo();
  const [share, setShare] = useState(true);
  const [win, setWin] = useState(WINDOWS[0]);
  const stage = state.stage;
  const html = useMemo(() => recycleMapHtml(), []);
  const drv = driverPos(stage, stageAge);
  const eta = stage === 3 ? DRIVER.etaStartMin : stage === 4 ? Math.max(1, Math.ceil(DRIVER.etaStartMin * (1 - (drv?.progress ?? 0)))) : 0;
  const step = stage >= 5 ? 3 : Math.max(0, stage - 2);
  const status =
    stage === 3 ? `Driver ${DRIVER.name} accepted. Heading to you, about ${eta} min away.`
    : stage === 4 ? `Driver is on the way to pick up your items, about ${eta} min away.`
    : stage === 5 ? 'Picked up and confirmed by both sides. Your item is on its way to the collection point.'
    : 'Your item has been handed on. Follow it in Activity.';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar title={`Hi, ${USER.name}`} subtitle="Recycle" />
      <Screen>
        <SectionHeader title="Pickup" />
        {stage === 0 ? (
          <Card>
            <EmptyState icon="package" title="No items yet" body="Run a Device check to register an item, then request a pickup." />
            <PrimaryButton label="Open Device check" icon="camera" onPress={() => router.push('/scan?mode=Device%20check')} />
          </Card>
        ) : stage === 1 ? (
          <Card style={{ gap: 12 }}>
            <Text style={type.cardTitle}>Request a pickup</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primarySoft, borderRadius: 12, padding: 12 }}>
              <Feather name="check-circle" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={type.cardTitle}>{LOT.name} · {LOT.id}</Text>
                <Text style={type.caption}>{LOT.weightKg} kg · held RM {LOT.heldRm.toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={type.body}>Share my location</Text>
              <Switch value={share} onValueChange={setShare} trackColor={{ true: colors.primary }} />
            </View>
            <SegmentedControl options={WINDOWS} value={win} onChange={setWin} />
            <PrimaryButton label="Request pickup" icon="truck" onPress={() => api.requestPickup()} />
          </Card>
        ) : stage === 2 ? (
          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={type.cardTitle}>Looking for a driver</Text>
              <Chip label="Requested" tone="warning" />
            </View>
            <Text style={type.body}>We are matching you with a nearby driver. This usually takes a minute.</Text>
            <SkeletonRow />
          </Card>
        ) : (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={type.cardTitle}>Driver {DRIVER.name} · {DRIVER.plate}</Text>
                <Text style={type.caption}>Rating {DRIVER.rating} ★ · Licensed</Text>
              </View>
              <Chip label={stage >= 5 ? 'Picked up' : stage === 4 ? 'On the way' : 'Assigned'} tone={stage >= 5 ? 'success' : 'warning'} />
            </View>
            <Text style={[type.body, { marginVertical: 10 }]}>{status}</Text>
            {stage <= 4 ? <Text style={[type.big, { fontSize: 26, color: colors.primary, marginBottom: 8 }]}>ETA {eta} min</Text> : null}
            <ProgressBar value={(step + 1) / STEPS.length} color={stage >= 5 ? colors.success : colors.primary} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              {STEPS.map((l, i) => <Text key={l} style={[type.caption, i <= step && { color: colors.primaryDark }]}>{l}</Text>)}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <Text style={type.body}>Share my location</Text>
              <Switch value={share} onValueChange={setShare} trackColor={{ true: colors.primary }} />
            </View>
            <View style={{ marginTop: 12, gap: 8 }}>
              {stage <= 5 ? <SecondaryButton label="Call driver" onPress={() => Alert.alert('Call driver', `Calling ${DRIVER.name} (mock). No call is placed in this demo.`)} /> : null}
              <PrimaryButton label="Track in Activity" icon="activity" onPress={() => router.navigate('/(tabs)/activity')} />
            </View>
          </Card>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
          <Text style={type.section}>Nearby collection points</Text>
          <Pressable onPress={() => Linking.openURL(DOE_DIRECTORY_URL)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[type.caption, { color: colors.primary }]}>DOE directory</Text>
            <Feather name="external-link" size={13} color={colors.primary} />
          </Pressable>
        </View>
        <MapFrame html={html} message={{ driver: share && drv ? { lat: drv.lat, lng: drv.lng } : null }} style={{ height: 300, borderRadius: 20 }} />
        {DOE_POINTS.slice(0, 3).map((p, i) => (
          <Card key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.primaryDark, fontFamily: 'Inter_700Bold' }}>{String.fromCharCode(65 + i)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.cardTitle} numberOfLines={1}>{p.name}</Text>
              <Text style={type.caption} numberOfLines={1}>{p.area} · {p.km} km{p.hours ? ` · ${p.hours}` : ''}</Text>
            </View>
            <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`)} style={{ padding: 8 }}>
              <Feather name="navigation" size={20} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => router.push('/scan?mode=Scan%20QR')} style={{ padding: 8 }}>
              <Feather name="log-in" size={20} color={colors.primary} />
            </Pressable>
          </Card>
        ))}
        <Pressable onPress={() => Linking.openURL(DOE_DIRECTORY_URL)}>
          <Text style={[type.caption, { textAlign: 'center' }]}>
            Collection points are listed from the DOE directory. Always check opening hours before visiting.{' '}
            <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>Open the official list</Text>
          </Text>
        </Pressable>
      </Screen>
    </View>
  );
}
