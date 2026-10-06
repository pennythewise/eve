import { Platform } from 'react-native';

export const colors = {
  primary: '#0A9C8A',
  primaryDark: '#067A6D',
  primaryDeep: '#054F49',
  primarySoft: '#D9F3EE',
  background: '#F4FAF9',
  surface: '#FFFFFF',
  text: '#0B2B28',
  muted: '#5E7B77',
  border: '#DCEBE8',
  success: '#1FAF6B',
  warning: '#E8A317',
  danger: '#D64545',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const space = { page: 16, gap: 12, tap: 44 } as const;
export const radius = { card: 16, cardLg: 20 } as const;

export const type = {
  pageTitle: { fontFamily: fonts.bold, fontSize: 28, color: colors.text },
  section: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  caption: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  big: { fontFamily: fonts.bold, fontSize: 34, color: colors.text, fontVariant: ['tabular-nums'] as ('tabular-nums')[] },
} as const;

export const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  default: { elevation: 2 },
})!;

export const rm = (n: number) => `RM ${n.toFixed(2)}`;
