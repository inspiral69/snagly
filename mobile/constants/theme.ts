/** Snagly design tokens — from DESIGN.md */

export const colors = {
  purple: '#6366F1',
  pink: '#EC4899',
  orange: '#F97316',
  navy: '#0F172A',
  navyElevated: '#1E293B',
  slate: '#334155',
  slateMuted: '#64748B',
  offWhite: '#F8FAFC',
  success: '#22C55E',
  warning: '#FBBF24',
  danger: '#EF4444',
} as const;

export const gradientBrand = [colors.purple, colors.pink, colors.orange] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const typography = {
  fontRegular: 'DMSans_400Regular',
  fontMedium: 'DMSans_500Medium',
  fontSemiBold: 'DMSans_600SemiBold',
  fontBold: 'DMSans_700Bold',
} as const;

export const snaglyDark = {
  dark: true,
  colors: {
    primary: colors.purple,
    background: colors.navy,
    card: colors.navyElevated,
    text: colors.offWhite,
    border: colors.slate,
    notification: colors.orange,
  },
  fonts: {
    regular: { fontFamily: typography.fontRegular, fontWeight: '400' as const },
    medium: { fontFamily: typography.fontMedium, fontWeight: '500' as const },
    bold: { fontFamily: typography.fontBold, fontWeight: '700' as const },
    heavy: { fontFamily: typography.fontBold, fontWeight: '800' as const },
  },
};
