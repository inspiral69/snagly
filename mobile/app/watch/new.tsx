import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '@/constants/theme';
import { buildEbaySearchUrl } from '@/lib/ebay';
import { useSnagly } from '@/lib/store';

export default function NewWatchScreen() {
  const { addWatch, settings } = useSnagly();
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [notes, setNotes] = useState('');
  const [minProfit, setMinProfit] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!title.trim() || !keywords.trim()) {
      Alert.alert('Missing details', 'Add a title and search keywords.');
      return;
    }
    setSaving(true);
    try {
      await addWatch({
        title: title.trim(),
        keywords: keywords.trim(),
        notes: notes.trim(),
        marketplace: 'ebay_uk',
        active: true,
        minProfitGbp: minProfit.trim() ? parseFloat(minProfit) : null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.form}>
          <Field
            label="What are you hunting?"
            placeholder="Sony 24-70 GM II"
            value={title}
            onChangeText={setTitle}
          />
          <Field
            label="Search keywords"
            placeholder="Sony FE 24-70mm f/2.8 GM II"
            value={keywords}
            onChangeText={setKeywords}
          />
          <Field
            label="Must-haves / notes"
            placeholder="Boxed, hood, GM II not I…"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Field
            label={`Min profit override (£) — default ${settings.minProfitGbp}`}
            placeholder="Optional"
            value={minProfit}
            onChangeText={setMinProfit}
            keyboard="decimal-pad"
          />

          {keywords.trim() ? (
            <Text style={styles.hint}>
              Preview search: {buildEbaySearchUrl(keywords.trim())}
            </Text>
          ) : null}

          <Pressable
            onPress={() => void onSave()}
            disabled={saving}
            style={({ pressed }) => [
              styles.save,
              (pressed || saving) && { opacity: 0.85 },
            ]}>
            <Text style={styles.saveText}>{saving ? 'Saving…' : 'Create watch'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboard = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboard?: 'default' | 'decimal-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slateMuted}
        multiline={multiline}
        keyboardType={keyboard}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  flex: {
    flex: 1,
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
  },
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
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  hint: {
    color: colors.slateMuted,
    fontFamily: typography.fontRegular,
    fontSize: 11,
    lineHeight: 16,
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
});
