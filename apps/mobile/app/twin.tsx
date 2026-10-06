import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, PrimaryButton, ProgressBar, Screen, SecondaryButton, SegmentedControl } from '../src/components';
import { PhoneTwin } from '../src/components/PhoneTwin';
import { EveEth } from '../src/components/EveEth';
import { DEFAULT_INTRO } from '../src/data/eveth';
import { colors, fonts, type } from '../src/theme';

const TABS = ['My twin', 'EVEth'];

export default function Twin() {
  const { top } = useSafeAreaInsets();
  const [tab, setTab] = useState(TABS[0]);
  const [intro, setIntro] = useState(DEFAULT_INTRO);
  const [published, setPublished] = useState(false);
  const mine = tab === TABS[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="chevron-left" size={26} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={type.pageTitle}>{mine ? 'Old phone' : 'EVEth'}</Text>
          <Text style={type.caption}>{mine ? 'Digital twin · EVE-PHN-00112' : 'A fake world where retired devices live on'}</Text>
        </View>
        {mine ? <Chip label="Complete" tone="success" /> : null}
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </View>
      <Screen>
        {mine ? (
          <>
            <PhoneTwin />
            <Text style={[type.caption, { textAlign: 'center' }]}>Drag to rotate · Illustrative model, not an exact scan</Text>
            <Card>
              <Text style={type.cardTitle}>Where it went</Text>
              <Text style={[type.body, { marginTop: 6 }]}>Recycled at a licensed facility. Recovered 182 g of material.</Text>
              <View style={{ marginTop: 12, gap: 6 }}>
                <ProgressBar value={0.78} color={colors.success} />
                <Text style={type.caption}>78% of the device mass recovered (estimate)</Text>
              </View>
            </Card>
            <Card>
              <Text style={type.cardTitle}>Introduce your device</Text>
              <Text style={[type.caption, { marginTop: 2 }]}>Write a few words in its voice. Publish it to EVEth or keep it private.</Text>
              <TextInput
                value={intro}
                onChangeText={setIntro}
                multiline
                maxLength={280}
                placeholder="Hi, I'm an old phone..."
                placeholderTextColor={colors.muted}
                style={{ marginTop: 10, minHeight: 96, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, fontFamily: fonts.regular, fontSize: 15, color: colors.text, textAlignVertical: 'top' }}
              />
              <Text style={[type.caption, { textAlign: 'right', marginTop: 4 }]}>{intro.length}/280</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 }}>
                <Text style={type.caption}>Status</Text>
                <Chip label={published ? 'Public on EVEth' : 'Private'} tone={published ? 'success' : 'muted'} />
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><PrimaryButton label={published ? 'Published' : 'Publish'} icon="globe" onPress={() => setPublished(true)} /></View>
                <View style={{ flex: 1 }}><SecondaryButton label="Private" onPress={() => setPublished(false)} /></View>
              </View>
            </Card>
          </>
        ) : (
          <EveEth intro={intro} published={published} />
        )}
      </Screen>
    </View>
  );
}
