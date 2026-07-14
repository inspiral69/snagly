import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useSnagly } from '@/lib/store';

export default function SettingsScreen() {
  const { settings, updateSettings, resetDemo } = useSnagly();
  const [feePercent, setFeePercent] = useState(String(settings.defaultFeePercent));
  const [feeFixed, setFeeFixed] = useState(String(settings.defaultFeeFixed));
  const [shippingOut, setShippingOut] = useState(String(settings.defaultShippingOut));
  const [minProfit, setMinProfit] = useState(String(settings.minProfitGbp));
  const [minRoi, setMinRoi] = useState(String(settings.minRoiPercent));
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await updateSettings({
      defaultFeePercent: parseFloat(feePercent) || 0,
      defaultFeeFixed: parseFloat(feeFixed) || 0,
      defaultShippingOut: parseFloat(shippingOut) || 0,
      minProfitGbp: parseFloat(minProfit) || 0,
      minRoiPercent: parseFloat(minRoi) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const onReset = () => {
    Alert.alert(
      'Reset demo data?',
      'This restores sample watches and deals, and resets your fee settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void resetDemo().then(() => {
              setFeePercent(String(12.9));
              setFeeFixed(String(0.3));
              setShippingOut(String(6));
              setMinProfit(String(25));
              setMinRoi(String(15));
            });
          },
        },
      ],
    );
  };

  return (
    <Screen
      title="Settings"
      subtitle="Fee defaults keep net profit estimates honest.">
      <Field
        label="Marketplace fee %"
        value={feePercent}
        onChangeText={setFeePercent}
        hint="eBay UK + managed payments typical band"
        keyboard="decimal-pad"
      />
      <Field
        label="Fixed fee (£)"
        value={feeFixed}
        onChangeText={setFeeFixed}
        keyboard="decimal-pad"
      />
      <Field
        label="Typical reshipping out (£)"
        value={shippingOut}
        onChangeText={setShippingOut}
        keyboard="decimal-pad"
      />
      <Field
        label="Min alert profit (£)"
        value={minProfit}
        onChangeText={setMinProfit}
        keyboard="decimal-pad"
      />
      <Field
        label="Min alert ROI (%)"
        value={minRoi}
        onChangeText={setMinRoi}
        keyboard="decimal-pad"
      />

      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Launch niche</Text>
        <Text style={styles.metaValue}>Cameras & lenses · eBay UK</Text>
      </View>

      <Pressable
        onPress={() => void save()}
        style={({ pressed }) => [styles.save, pressed && { opacity: 0.9 }]}>
        <Text style={styles.saveText}>{saved ? 'Saved' : 'Save settings'}</Text>
      </Pressable>

      <Pressable onPress={onReset} style={styles.reset}>
        <Text style={styles.resetText}>Reset demo data</Text>
      </Pressable>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  hint,
  keyboard = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  hint?: string;
  keyboard?: 'default' | 'decimal-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboard}
        placeholderTextColor={colors.slateMuted}
        style={styles.input}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    color: colors.offWhite,
    fontFamily: typography.fontMedium,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.navyElevated,
    borderWidth: 1,
    borderColor: colors.slate,
    borderRadius: radii.md,
    color: colors.offWhite,
    fontFamily: typography.fontRegular,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hint: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 12,
  },
  meta: {
    backgroundColor: colors.navyElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.slate,
    padding: spacing.md,
    gap: 4,
  },
  metaLabel: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 12,
  },
  metaValue: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 15,
  },
  save: {
    backgroundColor: colors.purple,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveText: {
    color: colors.offWhite,
    fontFamily: typography.fontSemiBold,
    fontSize: 16,
  },
  reset: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resetText: {
    color: colors.slateMuted,
    fontFamily: typography.fontMedium,
    fontSize: 14,
  },
});
