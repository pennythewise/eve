import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, type } from '../theme';
import { routeNodes } from '../data/route';
import { RouteMapView } from './RouteMapView';

// reached = index of the last node the item has arrived at; the red dot travels toward the next one.
export function RouteMap({ reached = 1 }: { reached?: number }) {
  return (
    <View style={{ gap: 8 }}>
      <RouteMapView reached={reached} />
      <View style={{ gap: 6 }}>
        {routeNodes.map((n, i) => (
          <View key={n.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name={i <= reached ? 'check-circle' : 'circle'} size={13} color={i <= reached ? colors.success : colors.border} />
            <View style={{ flex: 1 }}>
              <Text style={[type.caption, { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 11 }]} numberOfLines={1}>{n.label}</Text>
              <Text style={[type.caption, { fontSize: 10 }]} numberOfLines={1}>{i === reached + 1 ? `Sent to · ${n.sub}` : n.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
