import React, { useEffect, useRef } from 'react';
import { View, type ViewStyle } from 'react-native';

// Static HTML page in an iframe; live values reach it through postMessage so the map never reloads.
export function MapFrame({ html, message, style }: { html: string; message: unknown; style?: ViewStyle }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const json = JSON.stringify(message);
  const send = () => ref.current?.contentWindow?.postMessage(json, '*');
  useEffect(send, [json]);
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: '#E6F3F0' }, style]}>
      {/* @ts-ignore iframe is valid on react-native-web */}
      <iframe ref={ref} onLoad={send} srcDoc={html} style={{ border: 0, width: '100%', height: '100%' }} title="Map" />
    </View>
  );
}
