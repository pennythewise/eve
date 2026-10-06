import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Card } from '../components';
import { useDemo } from '../state/DemoProvider';
import { HISTORY, LOT, USER } from '../data/demo';
import { colors, fonts, type } from '../theme';

export function MyQr() {
  const { state } = useDemo();
  const items = [
    ...(state.stage >= 1 ? [{ id: LOT.id, label: LOT.name, payload: `eve:lot:${LOT.id}` }] : []),
    ...HISTORY.map((h) => ({ id: h.id, label: h.name, payload: `eve:lot:${h.id}` })),
    { id: USER.id, label: 'My ID', payload: `eve:user:${USER.id}` },
  ];
  const [sel, setSel] = useState(items[0].id);
  const cur = items.find((i) => i.id === sel) ?? items[0];
  return (
    <View style={{ gap: 12, flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
        {items.map((i) => (
          <Pressable key={i.id} onPress={() => setSel(i.id)} style={{ paddingHorizontal: 14, minHeight: 40, justifyContent: 'center', borderRadius: 999, backgroundColor: sel === i.id ? colors.primary : colors.surface, borderWidth: 1, borderColor: sel === i.id ? colors.primary : colors.border }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: sel === i.id ? '#fff' : colors.text }}>{i.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Card large style={{ alignItems: 'center', gap: 14, paddingVertical: 28 }}>
        <QRCode value={cur.payload} size={220} color={colors.text} backgroundColor="#fff" />
        <Text style={type.cardTitle}>{cur.id}</Text>
        <Text style={[type.caption, { textAlign: 'center' }]}>Show this to the driver or collection point.</Text>
      </Card>
    </View>
  );
}
