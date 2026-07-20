import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

import { BrandLogo } from '@/components/BrandLogo';
import { DealCard } from '@/components/DealCard';
import { HeroSummary } from '@/components/HeroSummary';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/constants/theme';
import { useSnagly } from '@/lib/store';

export default function HomeScreen() {
  const { deals, watches, unreadDealCount, refreshDeals, refreshingDeals } =
    useSnagly();
  const topDeals = [...deals]
    .sort((a, b) => Number(a.seen) - Number(b.seen) || b.netProfit - a.netProfit)
    .slice(0, 3);
  const activeWatches = watches.filter((w) => w.active).length;

  return (
    <Screen
      onRefresh={() => {
        void refreshDeals();
      }}
      refreshing={refreshingDeals}>
      <View style={styles.topBar}>
        <BrandLogo />
        <View style={styles.bellWrap}>
          <Text style={styles.bell}>●</Text>
          {unreadDealCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadDealCount}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <HeroSummary unreadCount={unreadDealCount} watchCount={activeWatches} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top opportunities</Text>
        <Link href="/(tabs)/deals" asChild>
          <Pressable>
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </Link>
      </View>

      {topDeals.length === 0 ? (
        <Text style={styles.empty}>
          {activeWatches === 0
            ? 'Add a watch, then pull down to check eBay.'
            : 'No strong deals right now — pull down to recheck, or enjoy the quiet.'}
        </Text>
      ) : (
        topDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  bellWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.navyElevated,
    borderWidth: 1,
    borderColor: colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: {
    color: colors.slateMuted,
    fontSize: 10,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.offWhite,
    fontFamily: typography.fontBold,
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 18,
  },
  link: {
    color: colors.purple,
    fontFamily: typography.fontMedium,
    fontSize: 14,
  },
  empty: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 15,
  },
});
