import React from 'react';
import { View } from 'react-native';
import { routeMapHtml } from './routeMapHtml';

export function RouteMapView({ reached }: { reached: number }) {
  return (
    <View style={{ aspectRatio: 0.9, borderRadius: 14, overflow: 'hidden', backgroundColor: '#E6F3F0' }}>
      {/* @ts-ignore iframe is valid on react-native-web */}
      <iframe key={reached} srcDoc={routeMapHtml(reached)} style={{ border: 0, width: '100%', height: '100%' }} title="Route map" />
    </View>
  );
}
