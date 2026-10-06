import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

// Simple flat illustrations, drawn with SVG shapes (no stock photos).
const T = '#0A9C8A', D = '#054F49', L = '#D9F3EE', Y = '#E8A317', C = '#C9772E', G2 = '#8FA9A5';

export function ImpactArt({ id, size = 64 }: { id: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {id === 'board' ? (
        <G>
          <Rect x="6" y="8" width="52" height="48" rx="6" fill={T} />
          <Rect x="14" y="16" width="16" height="16" rx="2" fill={D} />
          <Rect x="36" y="16" width="14" height="6" rx="1" fill={L} />
          <Rect x="36" y="26" width="14" height="6" rx="1" fill={L} />
          <Path d="M14 42H34M14 48H46M42 38V48" stroke={Y} strokeWidth="2.5" strokeLinecap="round" />
          <Circle cx="48" cy="46" r="3" fill={Y} />
        </G>
      ) : id === 'phone' ? (
        <G>
          <Rect x="17" y="4" width="30" height="56" rx="6" fill={D} />
          <Rect x="20" y="10" width="24" height="42" rx="2" fill={L} />
          <Rect x="25" y="14" width="14" height="8" rx="2" fill={T} />
          <Rect x="25" y="26" width="14" height="3" rx="1.5" fill={G2} />
          <Rect x="25" y="32" width="10" height="3" rx="1.5" fill={G2} />
          <Circle cx="32" cy="56" r="1.5" fill={L} />
        </G>
      ) : id === 'laptop' ? (
        <G>
          <Rect x="12" y="12" width="40" height="28" rx="3" fill={D} />
          <Rect x="15" y="15" width="34" height="22" rx="1.5" fill={L} />
          <Path d="M20 24H36M20 30H30" stroke={T} strokeWidth="3" strokeLinecap="round" />
          <Path d="M6 44H58L54 50H10Z" fill={T} />
        </G>
      ) : id === 'battery' ? (
        <G>
          <Rect x="22" y="6" width="20" height="6" rx="2" fill={G2} />
          <Rect x="16" y="10" width="32" height="48" rx="6" fill={T} />
          <Rect x="16" y="10" width="32" height="14" rx="6" fill={D} />
          <Path d="M34 28L26 42H32L30 52L38 38H32Z" fill={Y} />
        </G>
      ) : id === 'oven' ? (
        <G>
          <Rect x="8" y="10" width="48" height="46" rx="6" fill={G2} />
          <Rect x="8" y="10" width="48" height="12" rx="6" fill={D} />
          <Circle cx="18" cy="16" r="2.5" fill={Y} /><Circle cx="26" cy="16" r="2.5" fill={Y} /><Circle cx="46" cy="16" r="2.5" fill={L} />
          <Rect x="14" y="28" width="36" height="22" rx="3" fill={L} />
          <Rect x="18" y="32" width="28" height="14" rx="2" fill={T} fillOpacity="0.35" />
        </G>
      ) : (
        <G>
          <Circle cx="32" cy="32" r="24" fill="none" stroke={C} strokeWidth="5" />
          <Circle cx="32" cy="32" r="16" fill="none" stroke={C} strokeWidth="5" />
          <Circle cx="32" cy="32" r="8" fill="none" stroke={C} strokeWidth="5" />
          <Path d="M32 8V2M8 32H2" stroke={C} strokeWidth="5" strokeLinecap="round" />
        </G>
      )}
    </Svg>
  );
}
