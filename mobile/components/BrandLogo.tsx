import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, gradientBrand, typography } from '@/constants/theme';

type Props = {
  size?: 'sm' | 'lg';
};

export function BrandLogo({ size = 'sm' }: Props) {
  const isLg = size === 'lg';
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[...gradientBrand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mark, isLg && styles.markLg]}>
        <Text style={[styles.markText, isLg && styles.markTextLg]}>S</Text>
      </LinearGradient>
      <Text style={[styles.wordmark, isLg && styles.wordmarkLg]}>snagly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markLg: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  markText: {
    color: colors.offWhite,
    fontFamily: typography.fontBold,
    fontSize: 16,
  },
  markTextLg: {
    fontSize: 22,
  },
  wordmark: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 20,
    letterSpacing: -0.3,
    textTransform: 'lowercase',
  },
  wordmarkLg: {
    fontSize: 28,
  },
});
