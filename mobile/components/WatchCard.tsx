import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import type { Watch } from '@/types/models';
import { colors, radii, spacing, typography } from '@/constants/theme';

type Props = {
  watch: Watch;
  onToggle?: (watch: Watch) => void;
};

export function WatchCard({ watch, onToggle }: Props) {
  return (
    <View style={styles.card}>
      <Link href={`/watch/${watch.id}`} asChild>
        <Pressable style={({ pressed }) => [styles.main, pressed && { opacity: 0.85 }]}>
          <View style={styles.row}>
            <Text style={styles.title}>{watch.title}</Text>
            <View style={[styles.pill, watch.active ? styles.pillOn : styles.pillOff]}>
              <Text style={styles.pillText}>{watch.active ? 'Active' : 'Paused'}</Text>
            </View>
          </View>
          {watch.notes ? (
            <Text style={styles.notes} numberOfLines={2}>
              {watch.notes}
            </Text>
          ) : null}
          <Text style={styles.keywords} numberOfLines={1}>
            {watch.keywords}
          </Text>
        </Pressable>
      </Link>
      {onToggle ? (
        <Pressable
          onPress={() => onToggle(watch)}
          style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.7 }]}>
          <Text style={styles.toggleText}>{watch.active ? 'Pause' : 'Resume'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.navyElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.slate,
    overflow: 'hidden',
  },
  main: {
    padding: spacing.md,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 17,
  },
  pill: {
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillOn: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
  },
  pillOff: {
    backgroundColor: 'rgba(100, 116, 139, 0.35)',
  },
  pillText: {
    color: colors.offWhite,
    fontFamily: typography.fontMedium,
    fontSize: 12,
  },
  notes: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  keywords: {
    color: colors.purple,
    fontFamily: typography.fontMedium,
    fontSize: 13,
  },
  toggle: {
    borderTopWidth: 1,
    borderTopColor: colors.slate,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: {
    color: colors.offWhite,
    fontFamily: typography.fontMedium,
    fontSize: 14,
  },
});
