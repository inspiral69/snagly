import { StyleSheet, Text, View } from 'react-native';

import { DealCard } from '@/components/DealCard';
import { Screen } from '@/components/Screen';
import { colors, typography } from '@/constants/theme';
import { useSnagly } from '@/lib/store';

export default function DealsScreen() {
  const {
    deals,
    watches,
    refreshDeals,
    refreshingDeals,
    lastDealCheckAt,
    lastCheckSummary,
  } = useSnagly();

  const sorted = [...deals].sort((a, b) => b.netProfit - a.netProfit);
  const activeWatches = watches.filter((w) => w.active).length;

  const subtitle = lastCheckSummary?.message
    ? lastCheckSummary.message
    : 'Pull down to check eBay for your watches. Quiet is better than a dud alert.';

  return (
    <Screen
      title="Deals"
      subtitle={subtitle}
      onRefresh={() => {
        void refreshDeals();
      }}
      refreshing={refreshingDeals}>
      {lastDealCheckAt ? (
        <Text style={styles.meta}>
          Last checked {formatChecked(lastDealCheckAt)}
          {activeWatches ? ` · ${activeWatches} active watches` : ''}
        </Text>
      ) : null}

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {lastDealCheckAt ? 'No strong deals right now' : 'No deals yet'}
          </Text>
          <Text style={styles.emptyBody}>
            {activeWatches === 0
              ? 'Add a telescope watch first, then pull down to check live eBay UK listings.'
              : lastDealCheckAt
                ? 'Snagly checked your watches and nothing cleared the profit bar after fees and shipping. That’s a feature — not a bug.'
                : 'Pull down to run a live check against eBay UK sold comps.'}
          </Text>
        </View>
      ) : (
        sorted.map((deal) => <DealCard key={deal.id} deal={deal} />)
      )}
    </Screen>
  );
}

function formatChecked(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  meta: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 12,
  },
  empty: {
    gap: 8,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 18,
  },
  emptyBody: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 15,
    lineHeight: 22,
  },
});
