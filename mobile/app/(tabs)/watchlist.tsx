import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { WatchCard } from '@/components/WatchCard';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useSnagly } from '@/lib/store';

export default function WatchlistScreen() {
  const { watches, updateWatch } = useSnagly();

  return (
    <Screen
      title="Watchlist"
      subtitle="Tell Snagly what you’re hunting. We’ll watch eBay UK for you."
      headerRight={
        <Link href="/watch/new" asChild>
          <Pressable style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.addText}>+ New</Text>
          </Pressable>
        </Link>
      }>
      {watches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No watches yet</Text>
          <Text style={styles.emptyBody}>
            Create a watch for a model you know well — e.g. Sky-Watcher 200P.
          </Text>
          <Link href="/watch/new" asChild>
            <Pressable style={styles.primary}>
              <Text style={styles.primaryText}>Create watch</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        watches.map((watch) => (
          <WatchCard
            key={watch.id}
            watch={watch}
            onToggle={(w) => {
              void updateWatch(w.id, { active: !w.active });
            }}
          />
        ))
      )}

      {watches.length > 0 ? (
        <Text style={styles.hint}>
          Tip: tap a watch to edit or delete it.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  addText: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 14,
  },
  empty: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  primary: {
    alignSelf: 'flex-start',
    backgroundColor: colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  primaryText: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 15,
  },
  hint: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 13,
    lineHeight: 18,
  },
});
