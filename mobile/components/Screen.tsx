import { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/constants/theme';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function Screen({
  children,
  title,
  subtitle,
  headerRight,
  scroll = true,
  contentStyle,
  onRefresh,
  refreshing,
}: Props) {
  const body = (
    <View style={[styles.content, contentStyle]}>
      {(title || headerRight) && (
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {headerRight}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={colors.purple}
              />
            ) : undefined
          }>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  scroll: {
    paddingBottom: spacing.xl * 2,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.offWhite,
    fontFamily: typography.fontBold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 15,
    lineHeight: 22,
  },
});
