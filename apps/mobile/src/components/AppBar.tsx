import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme';
import { Chip } from './index';
import { useDemo } from '../state/DemoProvider';

export function AppBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { top } = useSafeAreaInsets();
  const { connected } = useDemo();
  return (
    <View style={{ paddingTop: top + 8, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Text style={type.caption}>{subtitle}</Text> : null}
        <Text style={type.pageTitle}>{title}</Text>
      </View>
      <Chip label={connected ? 'Connected' : 'Offline demo data'} tone={connected ? 'success' : 'muted'} />
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontFamily: fonts.bold }}>D</Text>
      </View>
    </View>
  );
}
