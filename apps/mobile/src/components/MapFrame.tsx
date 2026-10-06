import React, { useEffect, useRef } from 'react';
import { View, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

export function MapFrame({ html, message, style }: { html: string; message: unknown; style?: ViewStyle }) {
  const ref = useRef<WebView>(null);
  const json = JSON.stringify(message);
  const send = () => ref.current?.injectJavaScript(`window.__msg(${json});true;`);
  useEffect(send, [json]);
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: '#E6F3F0' }, style]}>
      <WebView ref={ref} originWhitelist={['*']} source={{ html }} onLoadEnd={send} scrollEnabled={false} style={{ backgroundColor: 'transparent' }} />
    </View>
  );
}
