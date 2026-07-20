import { useLocalSearchParams, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { formatGbp, formatRoi } from '@/lib/profit';
import { useSnagly } from '@/lib/store';

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deals, markDealSeen } = useSnagly();
  const deal = deals.find((d) => d.id === id);

  useEffect(() => {
    if (deal && !deal.seen) {
      void markDealSeen(deal.id);
    }
  }, [deal, markDealSeen]);

  if (!deal) {
    return (
      <Screen title="Deal">
        <Text style={styles.missing}>This deal is no longer available.</Text>
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Deal detail' }} />
      <Screen scroll>
        <View style={styles.hero}>
          <Text style={styles.title}>{deal.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatGbp(deal.buyPrice)}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {deal.percentBelowMarket >= 0
                  ? `${Math.round(deal.percentBelowMarket)}% below market`
                  : `${Math.round(Math.abs(deal.percentBelowMarket))}% above comps`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <Stat label="Est. profit" value={formatGbp(deal.netProfit)} hot />
          <Stat label="ROI" value={formatRoi(deal.roiPercent)} />
          <Stat label="Est. resale" value={formatGbp(deal.estResale)} />
          <Stat label="Confidence" value={cap(deal.confidence)} />
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.section}>Cost breakdown</Text>
          <Row label="Buy price" value={formatGbp(deal.buyPrice)} />
          <Row label="Fees (est.)" value={formatGbp(deal.fees)} />
          <Row label="Shipping in" value={formatGbp(deal.shippingIn)} />
          <Row label="Shipping out" value={formatGbp(deal.shippingOut)} />
          <Row label="Net profit" value={formatGbp(deal.netProfit)} strong />
        </View>

        <View style={styles.whyBox}>
          <Text style={styles.section}>Why it’s a good deal</Text>
          <Text style={styles.explanation}>{deal.explanation}</Text>
          {deal.why.map((item) => (
            <View key={item} style={styles.checkRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => void WebBrowser.openBrowserAsync(deal.listingUrl)}
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
          <Text style={styles.primaryText}>View on eBay</Text>
        </Pressable>
      </Screen>
    </>
  );
}

function Stat({
  label,
  value,
  hot,
}: {
  label: string;
  value: string;
  hot?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, hot && styles.hot]}>{value}</Text>
    </View>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  missing: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 15,
  },
  hero: {
    gap: spacing.sm,
  },
  title: {
    color: colors.offWhite,
    fontFamily: typography.fontBold,
    fontSize: 22,
    lineHeight: 28,
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
    fontSize: 28,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    width: '47%',
    backgroundColor: colors.navyElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.slate,
    padding: spacing.md,
    gap: 4,
  },
  statLabel: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 12,
  },
  statValue: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 18,
  },
  hot: {
    color: colors.success,
  },
  breakdown: {
    backgroundColor: colors.navyElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.slate,
    padding: spacing.md,
    gap: 10,
  },
  section: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 14,
  },
  rowValue: {
    color: colors.offWhite,
    fontFamily: typography.fontMedium,
    fontSize: 14,
  },
  strong: {
    color: colors.success,
    fontFamily: typography.fontSemiBold,
  },
  whyBox: {
    gap: spacing.sm,
  },
  explanation: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  checkRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  check: {
    color: colors.success,
    fontFamily: typography.fontBold,
    fontSize: 14,
    marginTop: 1,
  },
  checkText: {
    flex: 1,
    color: colors.offWhite,
    fontFamily: typography.fontRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  primary: {
    backgroundColor: colors.purple,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryText: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 16,
  },
});
