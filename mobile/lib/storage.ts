import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Deal, UserSettings, Watch } from '@/types/models';
import { DEFAULT_SETTINGS } from '@/types/models';
import { SEED_DEALS, SEED_WATCHES } from '@/lib/seed';

const KEYS = {
  settings: '@snagly/settings',
  watches: '@snagly/watches',
  deals: '@snagly/deals',
  seeded: '@snagly/seeded-v1',
} as const;

export async function loadSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function loadWatches(): Promise<Watch[]> {
  const raw = await AsyncStorage.getItem(KEYS.watches);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveWatches(watches: Watch[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.watches, JSON.stringify(watches));
}

export async function loadDeals(): Promise<Deal[]> {
  const raw = await AsyncStorage.getItem(KEYS.deals);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveDeals(deals: Deal[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.deals, JSON.stringify(deals));
}

/** First launch: seed demo watches + deals so UI isn’t empty. */
export async function ensureSeedData(): Promise<void> {
  const seeded = await AsyncStorage.getItem(KEYS.seeded);
  if (seeded) return;

  await saveSettings({ ...DEFAULT_SETTINGS });
  await saveWatches(SEED_WATCHES);
  await saveDeals(SEED_DEALS);
  await AsyncStorage.setItem(KEYS.seeded, '1');
}

export async function resetDemoData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.settings,
    KEYS.watches,
    KEYS.deals,
    KEYS.seeded,
  ]);
  await ensureSeedData();
}
