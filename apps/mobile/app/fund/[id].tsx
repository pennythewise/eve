import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, PrimaryButton, Screen } from '../../src/components';
import { useDemo } from '../../src/state/DemoProvider';
import { FUNDS } from '../../src/data/demo';
import { colors, type } from '../../src/theme';

export default function Fund() {
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invest } = useDemo();
  const f = FUNDS.find((x) => x.id === id) ?? FUNDS[0];
  const lo = Math.min(...f.series), hi = Math.max(...f.series);
  const pts = f.series.map((v, i) => `${(i / (f.series.length - 1)) * 300},${70 - ((v - lo) / (hi - lo || 1)) * 60}`);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="chevron-left" size={26} color={colors.text} />
        </Pressable>
        <Text style={[type.section, { flex: 1 }]} numberOfLines={1}>{f.name}</Text>
      </View>
      <Screen>
        <Card style={{ gap: 8 }}>
          <View style={{ height: 72, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Image source={f.logo} style={{ width: '75%', height: '100%' }} resizeMode="contain" />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[type.big, { fontSize: 28 }]}>{f.nav}</Text>
            <Chip label={f.restricted ? 'Sophisticated only' : f.risk} tone={f.restricted ? 'warning' : 'muted'} />
          </View>
          <Text style={type.caption}>NAV per unit, {f.navDate}</Text>
          <Text style={type.body}>{f.category} · {f.unitClass}</Text>
          {f.returns.map((r) => <Text key={r} style={[type.cardTitle, { color: r.startsWith('-') ? colors.danger : r.startsWith('+') ? colors.success : colors.text }]}>{r}</Text>)}
          <Svg width="100%" height={90} viewBox="0 0 300 80" preserveAspectRatio="none">
            <Path d={`M${pts.join(' L')}`} stroke={colors.primary} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={type.caption}>Demo series, not real performance. Figures shown are from a reference table, not live data.</Text>
        </Card>
        <Card><Text style={type.caption}>Minimum amount</Text><Text style={type.cardTitle}>{f.restricted ? 'Not available in this concept' : `RM ${f.min.toFixed(2)}`}</Text></Card>
        {f.restricted ? <Text style={[type.caption, { textAlign: 'center' }]}>Closed-end fund for sophisticated investors only. Investing is disabled.</Text>
          : <PrimaryButton label="Invest RM 10" icon="plus" onPress={() => { if (invest(f.id, 10)) router.back(); }} />}
        <Text style={[type.caption, { textAlign: 'center' }]}>Concept demo. Not a real investment product.</Text>
      </Screen>
    </View>
  );
}
