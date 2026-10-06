import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppBar } from '../../src/components/AppBar';
import { Card, Chip, PrimaryButton, Screen, SectionHeader, Timeline } from '../../src/components';
import { RouteMap } from '../../src/components/RouteMap';
import { useDemo } from '../../src/state/DemoProvider';
import { buildSteps, reachedFor, statusLabel, useAudit } from '../../src/state/derive';
import { DRIVER, HISTORY, LOT } from '../../src/data/demo';
import { colors, fonts, type } from '../../src/theme';

export default function Activity() {
  const { state, flags } = useDemo();
  const audit = useAudit(state);
  const items: { id: string; name: string; live: boolean; untracked?: boolean }[] = [...(state.stage >= 1 ? [{ id: LOT.id, name: LOT.name, live: true }] : []), ...HISTORY.map((h) => ({ id: h.id, name: h.name, live: false, untracked: h.untracked }))];
  const [sel, setSel] = useState<string | null>(null);
  const [openActor, setOpenActor] = useState<string | null>(null);
  const cur = items.find((i) => i.id === sel) ?? items[0];
  const live = cur.live;
  // A history item flagged `untracked` shows every step unticked (nothing recorded yet).
  const steps = buildSteps(live ? state : cur.untracked ? { ...state, stage: 0, handoverSigned: false, tamper: false, weightShortfall: false, unlicensedRecycler: false } : 'complete');
  const flagged = live && (flags.weight || flags.unlicensed);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar title="Activity" subtitle="My items" />
      <Screen>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
          {items.map((i) => (
            <Pressable key={i.id} onPress={() => setSel(i.id)} style={{ paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: 999, backgroundColor: cur.id === i.id ? colors.primary : colors.surface, borderWidth: 1, borderColor: cur.id === i.id ? colors.primary : colors.border }}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: cur.id === i.id ? '#fff' : colors.text }}>{i.name} · {i.id.slice(-5)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <Card style={{ flex: 1, padding: 12 }}>
            <Text style={type.cardTitle}>{cur.id}</Text>
            <Text style={[type.caption, { marginBottom: 8 }]}>{cur.name}{live ? ` · ${LOT.weightKg} kg` : ''}</Text>
            <View style={{ gap: 6, marginBottom: 12 }}>
              <Chip label={live ? statusLabel(state) : cur.untracked ? 'Not started' : 'Complete'} tone={(live && state.stage < 9) || cur.untracked ? 'warning' : 'success'} />
              {flagged ? <Chip label="Flagged" tone="danger" /> : null}
              {live && state.tamper ? <Chip label="Chain broken at event #3" tone="danger" /> : cur.untracked ? null : <Chip label="Record verified" tone="success" />}
            </View>
            {live && state.stage >= 3 && state.stage <= 5 ? (
              <View style={{ backgroundColor: colors.primarySoft, borderRadius: 10, padding: 8, marginBottom: 12 }}>
                <Text style={[type.caption, { color: colors.primaryDark }]}>Driver {DRIVER.name} · {DRIVER.plate}</Text>
              </View>
            ) : null}
            <Timeline steps={steps} />
            {live && state.stage === 1 ? <View style={{ marginTop: 12 }}><PrimaryButton label="Request pickup" icon="truck" onPress={() => router.navigate('/(tabs)')} /></View> : null}
          </Card>
          <Card style={{ flex: 1.15, padding: 12 }}>
            <Text style={[type.cardTitle, { marginBottom: 8 }]}>Location</Text>
            <RouteMap reached={live ? reachedFor(state.stage) : cur.untracked ? 0 : 3} />
          </Card>
        </View>

        <SectionHeader title="Network audit" />
        <Text style={type.caption}>All lots across the pilot (sample data plus live items)</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {audit.hops.map((h, i) => {
            const bad = i === audit.worst && h.flagged > 0;
            return (
              <View key={h.hop} style={{ flexDirection: 'row', padding: 14, alignItems: 'center', backgroundColor: bad ? '#F9E0E0' : '#fff', borderTopWidth: i ? 1 : 0, borderColor: colors.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={type.cardTitle}>{h.hop}</Text>
                  <Text style={type.caption}>{h.lots} lots · {h.flagged ? (i === 1 ? 'weight mismatch, unlicensed' : h.flag) : 'none'}</Text>
                </View>
                <Chip label={`${h.flagged} flagged`} tone={h.flagged ? 'danger' : 'success'} />
              </View>
            );
          })}
        </Card>
        <SectionHeader title="By actor" />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {audit.actors.map((a, i) => (
            <Pressable key={a.id} onPress={() => setOpenActor(openActor === a.id ? null : a.id)} style={{ padding: 14, borderTopWidth: i ? 1 : 0, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[type.cardTitle, { flex: 1 }]}>{a.id}</Text>
                <Text style={type.caption}>{a.flags} flags</Text>
                {a.id === audit.topActor ? <Chip label="Investigate" tone="danger" /> : null}
              </View>
              {openActor === a.id ? <Text style={[type.caption, { marginTop: 6 }]}>{a.lots.length ? `Flagged lots: ${a.lots.join(', ')}` : 'No flagged lots'}</Text> : null}
            </Pressable>
          ))}
        </Card>
        <PrimaryButton label="Generate report" icon="file-text" onPress={() => router.push('/report')} />
        <Text style={[type.caption, { textAlign: 'center' }]}>Sample data plus live items. A flag shows a mismatch, not guilt. Scales and rounding can cause small differences.</Text>
      </Screen>
    </View>
  );
}
