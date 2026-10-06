import React from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, PrimaryButton, Screen } from '../src/components';
import { useDemo } from '../src/state/DemoProvider';
import { useAudit } from '../src/state/derive';
import { colors, type } from '../src/theme';

export default function Report() {
  const { top } = useSafeAreaInsets();
  const { state } = useDemo();
  const a = useAudit(state);
  const date = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  const lines = [
    `EVE network audit report, ${date}`,
    `Total lots: ${a.totalLots}   Flagged: ${a.flagged}`,
    ...a.hops.map((h) => `${h.hop}: ${h.lots} lots, ${h.flagged} flagged`),
    `Highest-flag actor: ${a.topActor}`,
    `Chain status: ${a.chainOk ? 'verified' : 'BROKEN at event #3'}`,
    'Sample data plus live items. A flag shows a mismatch, not guilt.',
  ];
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={type.pageTitle}>Audit report</Text>
          <Text style={type.caption}>{date}</Text>
        </View>
        <Chip label={a.chainOk ? 'Chain verified' : 'Chain broken'} tone={a.chainOk ? 'success' : 'danger'} />
      </View>
      <Screen>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1 }}><Text style={[type.big, { fontSize: 28 }]}>{a.totalLots}</Text><Text style={type.caption}>Total lots</Text></Card>
          <Card style={{ flex: 1 }}><Text style={[type.big, { fontSize: 28, color: a.flagged ? colors.danger : colors.success }]}>{a.flagged}</Text><Text style={type.caption}>Flagged</Text></Card>
        </View>
        <Card style={{ gap: 10 }}>
          <Text style={type.cardTitle}>Flagged hops</Text>
          {a.hops.map((h, i) => (
            <View key={h.hop} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.body, i === a.worst && h.flagged ? { color: colors.danger } : null]}>{h.hop}</Text>
              <Text style={type.cardTitle}>{h.flagged}</Text>
            </View>
          ))}
        </Card>
        <Card style={{ gap: 6 }}>
          <Text style={type.cardTitle}>Worst actors</Text>
          {a.actors.filter((x) => x.flags).sort((x, y) => y.flags - x.flags).map((x) => (
            <View key={x.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={type.body}>{x.id}</Text><Text style={type.cardTitle}>{x.flags} flags</Text></View>
          ))}
        </Card>
        <PrimaryButton label="Share report" icon="share-2" onPress={() => Share.share({ message: lines.join('\n') })} />
        <Text style={[type.caption, { textAlign: 'center' }]}>Sample data plus live items. A flag shows a mismatch, not guilt.</Text>
      </Screen>
    </View>
  );
}
