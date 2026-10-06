import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, space, type } from '../theme';

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const body = { padding: space.page, gap: space.gap, paddingBottom: 120 };
  return scroll ? (
    <ScrollView style={s.screen} contentContainerStyle={body}>{children}</ScrollView>
  ) : (
    <View style={[s.screen, body]}>{children}</View>
  );
}

export function Card({ children, style, large }: { children: React.ReactNode; style?: ViewStyle; large?: boolean }) {
  return <View style={[s.card, large && { borderRadius: radius.cardLg }, style]}>{children}</View>;
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={s.sectionRow}>
      <Text style={type.section}>{title}</Text>
      {action ? <Text style={[type.caption, { color: colors.primary }]}>{action}</Text> : null}
    </View>
  );
}

type Tone = 'success' | 'warning' | 'danger' | 'primary' | 'muted';
const toneBg: Record<Tone, string> = {
  success: '#DDF5EA', warning: '#FBF0D5', danger: '#F9E0E0', primary: colors.primarySoft, muted: '#EAF1F0',
};
const toneFg: Record<Tone, string> = {
  success: colors.success, warning: '#A8740A', danger: colors.danger, primary: colors.primaryDark, muted: colors.muted,
};
export function Chip({ label, tone = 'primary' }: { label: string; tone?: Tone }) {
  return (
    <View style={[s.chip, { backgroundColor: toneBg[tone] }]}>
      <Text style={[s.chipText, { color: toneFg[tone] }]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon }: { label: string; onPress?: () => void; icon?: keyof typeof Feather.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.btn, { backgroundColor: pressed ? colors.primaryDark : colors.primary }]}>
      {icon ? <Feather name={icon} size={18} color="#fff" /> : null}
      <Text style={[s.btnText, { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.btn, { backgroundColor: pressed ? colors.primarySoft : colors.surface, borderWidth: 1.5, borderColor: colors.primary }]}>
      <Text style={[s.btnText, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.primary }: { value: number; color?: string }) {
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${Math.min(1, Math.max(0, value)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, padding: 12 }}>
      <Text style={[type.cardTitle, { fontSize: 20, fontFamily: fonts.bold }]}>{value}</Text>
      <Text style={type.caption}>{label}</Text>
    </Card>
  );
}

export function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => onChange(o)} style={[s.segItem, value === o && s.segActive]}>
          <Text style={[s.segText, value === o && { color: colors.primary, fontFamily: fonts.semibold }]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export type Step = { title: string; meta?: string; state: 'done' | 'current' | 'pending'; flag?: string; flagNote?: string; hash?: string; highlight?: boolean };
export function Timeline({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <View>
      {steps.map((st, i) => {
        const bad = st.highlight || !!st.flag;
        const c = st.state === 'pending' ? colors.border : st.highlight ? colors.danger : st.state === 'current' ? colors.warning : colors.success;
        const expanded = open === st.title && !!st.hash;
        return (
          <Pressable key={st.title} onPress={() => st.hash && setOpen(expanded ? null : st.title)} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 20 }}>
              <View style={[s.dot, { backgroundColor: st.state === 'pending' ? colors.surface : c, borderColor: c }]}>
                {st.state === 'done' ? <Feather name={st.highlight ? 'x' : 'check'} size={12} color="#fff" /> : null}
              </View>
              {i < steps.length - 1 ? <View style={[s.line, { backgroundColor: st.state === 'done' ? c : colors.border }]} /> : null}
            </View>
            <View style={[{ flex: 1, paddingBottom: 16 }, st.highlight && s.hl]}>
              <Text style={[type.cardTitle, st.state === 'pending' && { color: colors.muted }, bad && { color: colors.danger }]}>{st.title}</Text>
              {st.meta ? <Text style={type.caption}>{st.meta}</Text> : null}
              {st.flag ? (
                <View style={{ marginTop: 4, gap: 4 }}>
                  <Chip label={st.flag} tone="danger" />
                  {st.flagNote ? <Text style={[type.caption, { fontSize: 11 }]}>{st.flagNote}</Text> : null}
                </View>
              ) : null}
              {expanded ? (
                <View style={s.hashBox}>
                  <Text style={[type.caption, { color: colors.text }]}>Record #{i + 1} · {st.hash}</Text>
                  <Text style={type.caption}>{st.highlight ? 'Hash does not match the stored record' : 'Signed by both sides'}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: keyof typeof Feather.glyphMap; title: string; body: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 24, gap: 6 }}>
      <View style={s.emptyIcon}><Feather name={icon} size={24} color={colors.primary} /></View>
      <Text style={type.cardTitle}>{title}</Text>
      <Text style={[type.caption, { textAlign: 'center' }]}>{body}</Text>
    </View>
  );
}

export function SkeletonRow() {
  const o = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0.4, duration: 700, useNativeDriver: true }),
    ])).start();
  }, [o]);
  return <Animated.View style={{ height: 56, borderRadius: radius.card, backgroundColor: colors.border, opacity: o }} />;
}

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={s.toast}>
      <Feather name="bell" size={16} color="#fff" />
      <Text style={[type.body, { color: '#fff', flex: 1 }]}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, ...shadow },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  chipText: { fontFamily: fonts.semibold, fontSize: 12 },
  btn: { minHeight: space.tap, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  btnText: { fontFamily: fonts.semibold, fontSize: 15 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  seg: { flexDirection: 'row', backgroundColor: '#E6F1EF', borderRadius: 12, padding: 3 },
  segItem: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segActive: { backgroundColor: colors.surface, ...shadow },
  segText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  hl: { backgroundColor: '#F9E0E0', borderRadius: 10, padding: 8, marginBottom: 8, marginTop: -4 },
  hashBox: { marginTop: 6, backgroundColor: colors.background, borderRadius: 10, padding: 8, gap: 2 },
  line: { width: 2, flex: 1, marginTop: 2 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', top: 56, left: 16, right: 16, backgroundColor: colors.primaryDeep, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', ...shadow },
});
