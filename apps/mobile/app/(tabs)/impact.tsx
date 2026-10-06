import React, { useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import { AppBar } from '../../src/components/AppBar';
import { Card, PrimaryButton, ProgressBar, Screen, SectionHeader, StatTile } from '../../src/components';
import { ImpactArt } from '../../src/components/ImpactArt';
import { useDemo } from '../../src/state/DemoProvider';
import { LOT, UNLOCKABLES, VOUCHERS } from '../../src/data/demo';
import { colors, fonts, type } from '../../src/theme';

export default function Impact() {
  const { state, flags, wallet, spendPoints } = useDemo();
  const [sheet, setSheet] = useState<(typeof UNLOCKABLES)[number] | null>(null);
  const [code, setCode] = useState<{ title: string; code: string } | null>(null);
  const clean = !flags.weight && !flags.unlicensed && !flags.tamper && !state.weightShortfall && !state.unlicensedRecycler && !state.tamper;
  const counted = state.stage >= 9 && clean ? LOT.recoveredG : 0; // only clean, completed chains count
  const pending = state.stage === 8 && clean ? LOT.recoveredG : 0;
  const extraFor = (id: string) => (id === 'laptop' ? counted : 0);
  const pendFor = (id: string) => (id === 'laptop' ? pending : 0);

  const redeem = (v: (typeof VOUCHERS)[number]) => {
    if (wallet.points < v.cost) return;
    spendPoints(v.cost);
    setCode({ title: v.title, code: `EVE-${Math.random().toString(36).slice(2, 8).toUpperCase()}` });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar title="My Impact" subtitle="Unlockables" />
      <Screen>
        <Pressable onPress={() => router.push('/twin')}>
          <LinearGradient colors={[colors.primarySoft, '#BFE8E0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="box" size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[type.section, { color: colors.primaryDeep }]}>Miss your old item?</Text>
              <Text style={[type.body, { color: colors.primaryDark }]}>See its 3D digital twin</Text>
            </View>
            <Feather name="chevron-right" size={22} color={colors.primaryDark} />
          </LinearGradient>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatTile label="kg recycled" value={(3.4 + counted / 1000).toFixed(1)} />
          <StatTile label="Items" value={String(2 + (counted ? 1 : 0))} />
          <StatTile label="Clean chains" value={String(2 + (counted ? 1 : 0))} />
        </View>

        <SectionHeader title="Unlockables" />
        {!clean && state.stage >= 8 ? <Text style={[type.caption, { color: colors.danger }]}>This item is not counted: its chain is not clean.</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {UNLOCKABLES.map((it) => {
            const have = it.base + extraFor(it.id);
            const done = have >= it.need;
            const shown = have + pendFor(it.id);
            return (
              <Pressable key={it.id} style={{ width: '48%' }} onPress={() => setSheet(it)}>
                <Card style={{ alignItems: 'center', gap: 8 }}>
                  <View style={{ opacity: done ? 1 : 0.35, alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 76, height: 76, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                      <ImpactArt id={it.id} size={56} />
                    </View>
                    <Text style={type.cardTitle}>{it.name}</Text>
                  </View>
                  {!done ? <View style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }}><Feather name="lock" size={12} color="#fff" /></View> : null}
                  {done ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Feather name="check-circle" size={16} color={colors.success} /><Text style={[type.caption, { color: colors.success }]}>Unlocked</Text></View>
                  ) : (
                    <View style={{ width: '100%', gap: 4 }}>
                      <ProgressBar value={Math.min(1, shown / it.need)} color={pendFor(it.id) ? colors.warning : colors.primary} />
                      <Text style={[type.caption, { textAlign: 'center' }]}>{Math.min(shown, it.need).toLocaleString()} g of {it.need.toLocaleString()} g{pendFor(it.id) ? ' (pending)' : ''}</Text>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Redeem" action={`${wallet.points} points`} />
        {VOUCHERS.map((v) => (
          <Card key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {v.logo ? <Image source={v.logo} style={{ width: 48, height: 48 }} resizeMode="contain" /> : <Feather name="truck" size={22} color={colors.primary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.cardTitle}>{v.title}</Text>
              <Text style={type.caption}>{v.cost} points · Expires {v.expiry}</Text>
            </View>
            <View style={{ width: 96, opacity: wallet.points < v.cost ? 0.4 : 1 }}><PrimaryButton label="Redeem" onPress={() => redeem(v)} /></View>
          </Card>
        ))}
        <Text style={[type.caption, { textAlign: 'center' }]}>Illustrative offers. No partnership implied.</Text>
      </Screen>

      <Modal visible={!!sheet || !!code} transparent animationType="slide" onRequestClose={() => { setSheet(null); setCode(null); }}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'flex-end' }} onPress={() => { setSheet(null); setCode(null); }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12, alignItems: code ? 'center' : 'stretch' }}>
            {code ? (
              <>
                <Text style={type.section}>Voucher redeemed</Text>
                <Text style={type.body}>{code.title}</Text>
                <QRCode value={code.code} size={150} color={colors.text} />
                <Text style={{ fontFamily: fonts.bold, fontSize: 22, letterSpacing: 2, color: colors.primaryDark }}>{code.code}</Text>
                <Text style={type.caption}>Illustrative offer. No partnership implied.</Text>
              </>
            ) : sheet ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <ImpactArt id={sheet.id} size={48} />
                  <Text style={type.section}>{sheet.name}</Text>
                </View>
                <Text style={type.body}>Recovered material equals {sheet.share}.</Text>
                <Text style={type.caption}>Illustrative. Based on placeholder assumptions, not measured data.</Text>
              </>
            ) : null}
            <View style={{ alignSelf: 'stretch' }}><PrimaryButton label="Done" onPress={() => { setSheet(null); setCode(null); }} /></View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
