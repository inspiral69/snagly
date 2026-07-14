import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { useSnagly } from '@/lib/store';

export default function EditWatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { watches, updateWatch, deleteWatch } = useSnagly();
  const watch = useMemo(() => watches.find((w) => w.id === id), [watches, id]);

  const [title, setTitle] = useState(watch?.title ?? '');
  const [keywords, setKeywords] = useState(watch?.keywords ?? '');
  const [notes, setNotes] = useState(watch?.notes ?? '');
  const [minProfit, setMinProfit] = useState(
    watch?.minProfitGbp != null ? String(watch.minProfitGbp) : '',
  );

  if (!watch) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Watch not found.</Text>
      </SafeAreaView>
    );
  }

  const onSave = async () => {
    if (!title.trim() || !keywords.trim()) {
      Alert.alert('Missing details', 'Add a title and search keywords.');
      return;
    }
    await updateWatch(watch.id, {
      title: title.trim(),
      keywords: keywords.trim(),
      notes: notes.trim(),
      minProfitGbp: minProfit.trim() ? parseFloat(minProfit) : null,
    });
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete watch?', `Remove “${watch.title}” from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteWatch(watch.id).then(() => router.back());
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.form}>
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field label="Search keywords" value={keywords} onChangeText={setKeywords} />
          <Field
            label="Must-haves / notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Field
            label="Min profit override (£)"
            value={minProfit}
            onChangeText={setMinProfit}
            keyboard="decimal-pad"
            placeholder="Use settings default"
          />

          <Pressable
            onPress={() => void onSave()}
            style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }]}>
            <Text style={styles.saveText}>Save changes</Text>
          </Pressable>

          <Pressable onPress={onDelete} style={styles.delete}>
            <Text style={styles.deleteText}>Delete watch</Text>
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
  flex: { flex: 1 },
  form: {
    padding: spacing.md,
    gap: spacing.md,
  },
  field: { gap: 6 },
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
  delete: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteText: {
    color: colors.danger,
    fontFamily: typography.fontMedium,
    fontSize: 15,
  },
  missing: {
    color: colors.slateMuted,
    padding: spacing.md,
    fontFamily: typography.fontRegular,
  },
});
