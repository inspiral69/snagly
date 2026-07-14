import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, gradientBrand, radii, spacing, typography } from '@/constants/theme';

type Props = {
  unreadCount: number;
  watchCount: number;
};

export function HeroSummary({ unreadCount, watchCount }: Props) {
  const headline =
    unreadCount === 0
      ? 'All quiet — watching the market'
      : unreadCount === 1
        ? '1 new opportunity worth a look'
        : `${unreadCount} new opportunities worth a look`;

  return (
    <LinearGradient
      colors={[...gradientBrand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <Text style={styles.kicker}>Today</Text>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.sub}>
        {watchCount} active {watchCount === 1 ? 'watch' : 'watches'} · eBay UK · cameras
      </Text>
      <Link href="/(tabs)/deals" asChild>
        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaText}>View Deals</Text>
        </Pressable>
      </Link>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  kicker: {
    color: 'rgba(248, 250, 252, 0.85)',
    fontFamily: typography.fontMedium,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    color: colors.offWhite,
    fontFamily: typography.fontBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  sub: {
    color: 'rgba(248, 250, 252, 0.9)',
    fontFamily: typography.fontRegular,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.offWhite,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  ctaText: {
    color: colors.navy,
    fontFamily: typography.fontSemiBold,
    fontSize: 15,
  },
});
