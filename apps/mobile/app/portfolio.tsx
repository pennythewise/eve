import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, PrimaryButton, ProgressBar, Screen, SecondaryButton } from '../src/components';
import { useDemo } from '../src/state/DemoProvider';
import { FUNDS } from '../src/data/demo';
import { colors, rm, type } from '../src/theme';

export default function Portfolio() {
  const { top } = useSafeAreaInsets();
  const { wallet, invest, withdraw } = useDemo();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="chevron-left" size={26} color={colors.text} />
        </Pressable>
        <Text style={type.pageTitle}>Portfolio</Text>
      </View>
      <Screen>
        <Card>
          <Text style={type.caption}>Invested</Text>
          <Text style={type.big}>{rm(wallet.invested)}</Text>
          <Text style={[type.caption, { color: colors.success }]}>Simulated P/L +RM {wallet.pl.toFixed(2)}</Text>
          <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 12, backgroundColor: colors.border }}>
            {wallet.holdings.map((h, i) => <View key={h.fundId} style={{ flex: h.principal, backgroundColor: [colors.primary, colors.primaryDeep, colors.warning][i % 3] }} />)}
          </View>
        </Card>
        {wallet.holdings.length === 0 ? <Text style={[type.caption, { textAlign: 'center' }]}>No holdings yet. Invest in a fund to start.</Text> : null}
        {wallet.holdings.map((h) => {
          const f = FUNDS.find((x) => x.id === h.fundId)!;
          return (
            <Card key={h.fundId} style={{ gap: 6 }}>
              <Text style={type.cardTitle}>{f.name}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={type.caption}>Invested {rm(h.principal)}</Text>
                <Text style={type.caption}>Value {rm(h.principal + h.pl)}</Text>
              </View>
              <Text style={[type.cardTitle, { color: colors.success }]}>+RM {h.pl.toFixed(2)} (+{((h.pl / h.principal) * 100).toFixed(2)}%)</Text>
              <ProgressBar value={Math.min(1, h.principal / Math.max(wallet.invested, 1))} />
            </Card>
          );
        })}
        <Text style={type.caption}>Available to invest: {rm(wallet.available)}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}><PrimaryButton label="Invest RM 10" icon="plus" onPress={() => invest('principal', 10)} /></View>
          <View style={{ flex: 1 }}><SecondaryButton label="Withdraw RM 10" onPress={() => withdraw('principal', 10)} /></View>
        </View>
        <Text style={[type.caption, { textAlign: 'center' }]}>Concept demo. Not a real investment product. Simulated growth.</Text>
      </Screen>
    </View>
  );
}
