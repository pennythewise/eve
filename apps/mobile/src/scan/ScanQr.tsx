import React, { useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Card, Chip, PrimaryButton, SecondaryButton } from '../components';
import { useDemo } from '../state/DemoProvider';
import { colors, type } from '../theme';
import { QR_PAYLOADS } from '@eve/shared';

type Result = { title: string; body: string; tone: 'success' | 'warning' };

export function ScanQr() {
  const { api, toast } = useDemo();
  const [perm, ask] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const busy = useRef(false);

  const handle = async (payload: string) => {
    if (busy.current) return;
    busy.current = true;
    const r = await api.scan(payload);
    if (r.kind === 'error') { busy.current = false; return; }
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    if (r.kind === 'driver') setResult(r.bothSides
      ? { title: 'Confirmed by both sides', body: 'The driver has also signed. Handover complete.', tone: 'success' }
      : { title: 'Handover signed', body: 'Waiting for the driver to confirm on their side.', tone: 'warning' });
    else if (r.kind === 'point') setResult({ title: 'Drop-off recorded', body: 'Place the item on the point scale. The weight is simulated from the controller.', tone: 'success' });
    else setResult({ title: 'Item passport opened', body: 'See the full timeline in Activity.', tone: 'success' });
  };

  const reset = () => { busy.current = false; setResult(null); };
  const showCamera = perm?.granted && !result;

  return (
    <View style={{ gap: 12, flex: 1 }}>
      {result ? (
        <Card large style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: result.tone === 'success' ? '#DDF5EA' : '#FBF0D5', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={result.tone === 'success' ? 'check' : 'clock'} size={30} color={result.tone === 'success' ? colors.success : colors.warning} />
          </View>
          <Text style={type.section}>{result.title}</Text>
          <Text style={[type.body, { textAlign: 'center' }]}>{result.body}</Text>
          <Chip label="Recorded" tone="success" />
          <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
            <PrimaryButton label="View in Activity" onPress={() => router.dismissTo('/(tabs)/activity')} />
            <SecondaryButton label="Scan another" onPress={reset} />
          </View>
        </Card>
      ) : (
        <View style={{ height: 340, borderRadius: 20, overflow: 'hidden', backgroundColor: '#0B2B28', alignItems: 'center', justifyContent: 'center' }}>
          {showCamera ? (
            <CameraView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back" enableTorch={torch}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => handle(data)} />
          ) : (
            <View style={{ alignItems: 'center', gap: 10, padding: 24 }}>
              <Feather name="camera-off" size={32} color="#9FD9D0" />
              <Text style={[type.body, { color: '#fff', textAlign: 'center' }]}>
                {perm && !perm.granted ? 'Camera access is needed to scan QR codes. You can also use the demo buttons below.' : 'Starting camera...'}
              </Text>
              {perm && !perm.granted ? <PrimaryButton label="Allow camera" onPress={ask} /> : null}
            </View>
          )}
          {showCamera ? (
            <>
              <View style={{ width: 220, height: 220, borderRadius: 24, borderWidth: 3, borderColor: '#fff' }} />
              <Pressable onPress={() => setTorch((t) => !t)} style={{ position: 'absolute', right: 12, top: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,.45)', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={torch ? 'zap' : 'zap-off'} size={20} color="#fff" />
              </Pressable>
            </>
          ) : null}
        </View>
      )}
      {!result ? (
        <Card style={{ gap: 8 }}>
          <Text style={type.cardTitle}>Demo shortcuts</Text>
          <Text style={type.caption}>{Platform.OS === 'web' ? 'Browsers cannot scan QR here. ' : ''}Demo mode accepts the QR codes shown on the /sim page, or tap one below.</Text>
          {QR_PAYLOADS.map((q) => <SecondaryButton key={q.payload} label={`Simulate: ${q.label}`} onPress={() => handle(q.payload)} />)}
        </Card>
      ) : null}
    </View>
  );
}
