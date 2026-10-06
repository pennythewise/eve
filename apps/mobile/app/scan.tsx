import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SegmentedControl } from '../src/components';
import { MyQr } from '../src/scan/MyQr';
import { ScanQr } from '../src/scan/ScanQr';
import { DeviceCheck } from '../src/scan/DeviceCheck';
import { colors, type } from '../src/theme';

const modes = ['My QR', 'Scan QR', 'Device check'];

export default function Scan() {
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState(modes.includes(params.mode ?? '') ? (params.mode as string) : 'Scan QR');
  useEffect(() => { if (params.mode && modes.includes(params.mode)) setMode(params.mode); }, [params.mode]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
        <Text style={type.pageTitle}>Scan</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <SegmentedControl options={modes} value={mode} onChange={setMode} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {mode === 'My QR' ? <MyQr /> : mode === 'Scan QR' ? <ScanQr /> : <DeviceCheck onCreated={() => router.dismissTo('/(tabs)/activity')} />}
      </ScrollView>
    </View>
  );
}
