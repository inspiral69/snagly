import { colors } from '@/constants/theme';

/** Legacy template helper — Snagly is dark-first. */
export default {
  light: {
    text: colors.navy,
    background: colors.offWhite,
    tint: colors.purple,
    tabIconDefault: colors.slateMuted,
    tabIconSelected: colors.purple,
  },
  dark: {
    text: colors.offWhite,
    background: colors.navy,
    tint: colors.purple,
    tabIconDefault: colors.slateMuted,
    tabIconSelected: colors.purple,
  },
};
