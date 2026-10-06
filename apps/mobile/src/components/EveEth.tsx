import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, Chip, Timeline } from './index';
import { EveGlobe } from './EveGlobe';
import { DeviceTwin3D } from './DeviceTwin3D';
import { EVETH_DEVICES, MY_DEVICE_ID, type EveDevice } from '../data/eveth';
import { colors, fonts, type } from '../theme';

export function EveEth({ intro, published }: { intro: string; published: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<string, { user: string; text: string }[]>>({});
  const [draft, setDraft] = useState('');

  // My device always reflects the introduction typed on the first tab.
  const devices = useMemo<EveDevice[]>(() => EVETH_DEVICES.map((d) => (d.mine ? { ...d, story: intro.trim() || d.story } : d)), [intro]);
  const dev = devices.find((d) => d.id === selected) ?? null;

  const send = () => {
    const text = draft.trim();
    if (!dev || !text) return;
    setAdded((a) => ({ ...a, [dev.id]: [...(a[dev.id] ?? []), { user: 'you', text }] }));
    setDraft('');
  };

  return (
    <>
      <EveGlobe devices={devices} selected={selected} onSelect={setSelected} />
      <Text style={[type.caption, { textAlign: 'center' }]}>Drag to spin · Tap a glowing device to meet its twin</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {devices.map((d) => (
          <Pressable key={d.id} onPress={() => setSelected(d.id)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: d.id === selected ? d.color : colors.surface, borderWidth: 1, borderColor: d.color }}>
            <Text style={[type.caption, { color: d.id === selected ? '#fff' : colors.text }]}>{d.emoji} {d.mine ? 'You' : d.owner}</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={!!dev} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable onPress={() => setSelected(null)} style={{ flex: 1, backgroundColor: 'rgba(5,47,43,0.6)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 520, maxHeight: '92%', backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            {dev ? (
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                <DeviceTwin3D id={dev.id} />
                <Text style={[type.caption, { textAlign: 'center', marginVertical: 6 }]}>Drag to rotate · Illustrative model</Text>
                <Pressable onPress={() => setSelected(null)} style={{ position: 'absolute', top: 24, right: 24, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="x" size={20} color={colors.text} />
                </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 32 }}>{dev.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={type.cardTitle}>{dev.name}</Text>
              <Text style={type.caption}>{dev.mine ? 'Yours' : `Owner ${dev.owner}`} · {dev.place}</Text>
            </View>
            {dev.mine ? <Chip label={published ? 'Public' : 'Private'} tone={published ? 'success' : 'muted'} /> : null}
          </View>
          <Text style={[type.body, { marginTop: 10 }]}>{dev.story}</Text>

          <Text style={[type.cardTitle, { marginTop: 14, marginBottom: 8 }]}>Where it went</Text>
          <Timeline steps={dev.journey.map((j) => ({ title: j.title, meta: j.meta, state: 'done' as const }))} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
            <Pressable onPress={() => setLiked((l) => ({ ...l, [dev.id]: !l[dev.id] }))} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
              <Feather name="heart" size={20} color={liked[dev.id] ? colors.danger : colors.muted} />
              <Text style={[type.body, { fontFamily: fonts.semibold }]}>{dev.likes + (liked[dev.id] ? 1 : 0)}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="message-circle" size={20} color={colors.muted} />
              <Text style={[type.body, { fontFamily: fonts.semibold }]}>{dev.comments.length + (added[dev.id]?.length ?? 0)}</Text>
            </View>
          </View>

          <View style={{ gap: 8, marginTop: 6 }}>
            {[...dev.comments, ...(added[dev.id] ?? [])].map((c, i) => (
              <View key={i} style={{ backgroundColor: colors.background, borderRadius: 12, padding: 10 }}>
                <Text style={[type.caption, { color: colors.primaryDark }]}>@{c.user}</Text>
                <Text style={type.body}>{c.text}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              placeholder="Add a comment"
              placeholderTextColor={colors.muted}
              style={{ flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, fontFamily: fonts.regular, fontSize: 15, color: colors.text }}
            />
            <Pressable onPress={send} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="send" size={18} color="#fff" />
            </Pressable>
          </View>
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
