import React, { useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBar } from '../../src/components/AppBar';
import { Card, Chip, PrimaryButton, Screen, SecondaryButton, SectionHeader } from '../../src/components';
import { useDemo } from '../../src/state/DemoProvider';
import { FUNDS } from '../../src/data/demo';
import { colors, fonts, radius, rm, type } from '../../src/theme';

export function plText(pl: number, pct: number) {
  return `Open P/L ${pl >= 0 ? '+' : '-'}RM ${Math.abs(pl).toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`;
}

export default function Labur() {
  const { wallet, state, invest } = useDemo();
  const [sheet, setSheet] = useState(false);
  const total = wallet.available + wallet.held + wallet.invested + wallet.pl;
  const heldLabel = wallet.underReview ? 'Under review' : 'Held';
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar title="Labur" subtitle="Wallet and funds" />
      <Screen>
        <Pressable onPress={() => router.push('/portfolio')}>
          <LinearGradient colors={[colors.primary, colors.primaryDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.cardLg, padding: 20, gap: 8 }}>
            <Text style={[type.caption, { color: '#CFEFE9' }]}>Total balance</Text>
            <Text style={[type.big, { color: '#fff' }]}>{rm(total)}</Text>
            <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontFamily: fonts.semibold, fontSize: 12 }}>{plText(wallet.pl, wallet.plPct)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 24, marginTop: 8, alignItems: 'flex-end' }}>
              <View>
                <Text style={[type.caption, { color: '#CFEFE9' }]}>Available</Text>
                <Text style={{ color: '#fff', fontFamily: fonts.semibold, fontSize: 16 }}>{rm(wallet.available)}</Text>
              </View>
              <Pressable onPress={() => setSheet(true)} hitSlop={10}>
                <Text style={[type.caption, { color: wallet.underReview ? '#FFD98A' : '#CFEFE9' }]}>{heldLabel}  ⓘ</Text>
                <Text style={{ color: '#fff', fontFamily: fonts.semibold, fontSize: 16 }}>{rm(wallet.underReview ? 4.2 : wallet.held)}</Text>
              </Pressable>
              {state.stage >= 1 && wallet.held > 0 && !wallet.underReview ? <Chip label="Early-bird bonus" tone="warning" /> : null}
            </View>
          </LinearGradient>
        </Pressable>

        <SectionHeader title="Funds" action="Simulated growth" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {FUNDS.map((f) => (
            <Pressable key={f.id} onPress={() => router.push(`/fund/${f.id}`)}>
              <Card style={{ width: 290, minHeight: 430, gap: 10 }}>
                <View style={{ height: 64, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Image source={f.logo} style={{ width: '88%', height: '100%' }} resizeMode="contain" />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <Text style={[type.cardTitle, { flex: 1 }]} numberOfLines={3}>{f.name}</Text>
                  <Chip label={f.restricted ? 'Sophisticated only' : f.risk} tone={f.restricted ? 'warning' : 'muted'} />
                </View>
                <Text style={type.caption}>{f.category}</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={type.caption}>Unit class</Text>
                    <Text style={[type.body, { fontFamily: fonts.medium, fontSize: 13 }]}>{f.unitClass}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={type.caption}>NAV (unit price)</Text>
                    <Text style={[type.body, { fontFamily: fonts.semibold, fontSize: 13 }]}>{f.nav}</Text>
                    <Text style={[type.caption, { fontSize: 10 }]}>{f.navDate}</Text>
                  </View>
                </View>
                <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 8 }}>
                  <Text style={type.caption}>Historical return</Text>
                  {f.returns.map((r) => <Text key={r} style={[type.cardTitle, { fontSize: 14, color: r.startsWith('-') ? colors.danger : r.startsWith('+') ? colors.success : colors.text }]}>{r}</Text>)}
                </View>
                <View style={{ marginTop: 'auto', gap: 8 }}>
                  <SecondaryButton label="Know more" onPress={() => (f.moreUrl ? Linking.openURL(f.moreUrl) : router.push(`/fund/${f.id}`))} />
                  {f.restricted ? <Text style={[type.caption, { textAlign: 'center' }]}>Sophisticated investors only</Text> : <PrimaryButton label="Invest RM 10" icon="plus" onPress={() => invest(f.id, 10)} />}
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={[type.caption, { textAlign: 'center', marginTop: 8 }]}>Concept demo. Not a real investment product. Not affiliated with any wallet provider.</Text>
      </Screen>

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'flex-end' }} onPress={() => setSheet(false)}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 }}>
            <Text style={type.section}>{wallet.underReview ? 'Credit under review' : 'Held credit'}</Text>
            <Text style={type.body}>
              {wallet.underReview
                ? 'A flag was raised on this item, so the credit is paused while the record is reviewed.'
                : 'Released after your item reaches a licensed recycler with a clean record.'}
            </Text>
            <PrimaryButton label="Got it" onPress={() => setSheet(false)} />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
