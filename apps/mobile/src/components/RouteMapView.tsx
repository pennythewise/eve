import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { routeMapHtml } from './routeMapHtml';

export function RouteMapView({ reached }: { reached: number }) {
  return (
    <View style={{ aspectRatio: 0.9, borderRadius: 14, overflow: 'hidden', backgroundColor: '#E6F3F0' }}>
      <WebView key={reached} originWhitelist={['*']} source={{ html: routeMapHtml(reached) }} scrollEnabled={false} style={{ backgroundColor: 'transparent' }} />
    </View>
  );
}
