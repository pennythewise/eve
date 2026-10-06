import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, shadow } from '../../src/theme';

type Icon = keyof typeof Feather.glyphMap;
const icon = (name: Icon) => ({ focused, size }: { focused: boolean; size: number }) => <Feather name={name} size={size} color={focused ? colors.primary : colors.muted} />;

function ScanButton() {
  return (
    <View style={s.scanWrap} pointerEvents="box-none">
      <Pressable onPress={() => router.push('/scan')} style={({ pressed }) => [s.scan, pressed && { backgroundColor: colors.primaryDark }]}>
        <Feather name="maximize" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: { height: 64 + 18, paddingTop: 6, backgroundColor: colors.surface, borderTopColor: colors.border, ...shadow },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Recycle', tabBarIcon: icon('repeat') }} />
      <Tabs.Screen name="labur" options={{ title: 'Labur', tabBarIcon: icon('trending-up') }} />
      <Tabs.Screen name="launch" options={{ title: '', tabBarButton: () => <ScanButton /> }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: icon('activity') }} />
      <Tabs.Screen name="impact" options={{ title: 'My Impact', tabBarIcon: icon('award') }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  scanWrap: { flex: 1, alignItems: 'center' },
  scan: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, marginTop: -16,
    borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primaryDeep, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
});
