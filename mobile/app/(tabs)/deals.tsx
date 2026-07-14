import { StyleSheet, Text, View } from 'react-native';

import { DealCard } from '@/components/DealCard';
import { Screen } from '@/components/Screen';
import { colors, typography } from '@/constants/theme';
import { useSnagly } from '@/lib/store';

export default function DealsScreen() {
  const { deals } = useSnagly();
  const sorted = [...deals].sort(
    (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
  );

  return (
    <Screen
      title="Deals"
      subtitle="High-quality opportunities only — quiet is better than a dud alert.">
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No deals yet</Text>
          <Text style={styles.emptyBody}>
            Once live eBay checks are wired up, strong matches for your watches will land
            here.
          </Text>
        </View>
      ) : (
        sorted.map((deal) => <DealCard key={deal.id} deal={deal} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
