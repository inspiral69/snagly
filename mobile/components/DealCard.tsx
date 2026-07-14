import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import type { Deal } from '@/types/models';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { formatGbp, formatRoi } from '@/lib/profit';

type Props = {
  deal: Deal;
};

export function DealCard({ deal }: Props) {
  return (
    <Link href={`/deal/${deal.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {deal.title}
          </Text>
          {!deal.seen ? <View style={styles.dot} /> : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatGbp(deal.buyPrice)}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{Math.round(deal.percentBelowMarket)}% below market</Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <Metric label="Est. profit" value={formatGbp(deal.netProfit)} emphasize />
          <Metric label="ROI" value={formatRoi(deal.roiPercent)} />
          <Metric label="Confidence" value={labelConfidence(deal.confidence)} />
        </View>
      </Pressable>
    </Link>
  );
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, emphasize && styles.metricEmphasize]}>{value}</Text>
    </View>
  );
}

function labelConfidence(c: Deal['confidence']) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.navyElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.slate,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  price: {
    color: colors.offWhite,
    fontFamily: typography.fontBold,
    fontSize: 20,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.purple,
    fontFamily: typography.fontMedium,
    fontSize: 12,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 12,
  },
  metricValue: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 15,
  },
  metricEmphasize: {
    color: colors.success,
  },
});
