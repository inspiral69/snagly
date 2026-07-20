import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Deal, UserSettings, Watch } from '@/types/models';
import { fetchDealCandidates } from '@/lib/ebay';
import { candidateToDeal } from '@/lib/dealsMap';
import {
  ensureSeedData,
  loadDeals,
  loadLastDealCheck,
  loadSettings,
  loadWatches,
  resetDemoData,
  saveDeals,
  saveLastDealCheck,
  saveSettings,
  saveWatches,
} from '@/lib/storage';

type CheckSummary = {
  checkedWatches: number;
  dealCount: number;
  message: string;
};

type SnaglyStore = {
  ready: boolean;
  settings: UserSettings;
  watches: Watch[];
  deals: Deal[];
  unreadDealCount: number;
  refreshingDeals: boolean;
  lastDealCheckAt: string | null;
  lastCheckSummary: CheckSummary | null;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  addWatch: (input: Omit<Watch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Watch>;
  updateWatch: (id: string, patch: Partial<Watch>) => Promise<void>;
  deleteWatch: (id: string) => Promise<void>;
  markDealSeen: (id: string) => Promise<void>;
  refreshDeals: () => Promise<CheckSummary>;
  resetDemo: () => Promise<void>;
};

const StoreContext = createContext<SnaglyStore | null>(null);

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function SnaglyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [refreshingDeals, setRefreshingDeals] = useState(false);
  const [lastDealCheckAt, setLastDealCheckAt] = useState<string | null>(null);
  const [lastCheckSummary, setLastCheckSummary] = useState<CheckSummary | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureSeedData();
      const [s, w, d, lastCheck] = await Promise.all([
        loadSettings(),
        loadWatches(),
        loadDeals(),
        loadLastDealCheck(),
      ]);
      if (cancelled) return;
      setSettings(s);
      setWatches(w);
      setDeals(d);
      setLastDealCheckAt(lastCheck);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const addWatch = useCallback(
    async (input: Omit<Watch, 'id' | 'createdAt' | 'updatedAt'>) => {
      const stamp = new Date().toISOString();
      const watch: Watch = {
        ...input,
        id: newId('watch'),
        createdAt: stamp,
        updatedAt: stamp,
      };
      setWatches((prev) => {
        const next = [watch, ...prev];
        void saveWatches(next);
        return next;
      });
      return watch;
    },
    [],
  );

  const updateWatch = useCallback(async (id: string, patch: Partial<Watch>) => {
    setWatches((prev) => {
      const next = prev.map((w) =>
        w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w,
      );
      void saveWatches(next);
      return next;
    });
  }, []);

  const deleteWatch = useCallback(async (id: string) => {
    setWatches((prev) => {
      const next = prev.filter((w) => w.id !== id);
      void saveWatches(next);
      return next;
    });
  }, []);

  const markDealSeen = useCallback(async (id: string) => {
    setDeals((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, seen: true } : d));
      void saveDeals(next);
      return next;
    });
  }, []);

  const refreshDeals = useCallback(async () => {
    setRefreshingDeals(true);
    try {
      const active = watches.filter((w) => w.active && w.keywords.trim());
      const previousById = new Map(deals.map((d) => [d.id, d]));
      const nextDeals: Deal[] = [];

      for (const watch of active) {
        const result = await fetchDealCandidates({
          keywords: watch.keywords,
          niche: 'telescopes',
          limit: 10,
        });

        for (const candidate of result.deals) {
          const mapped = candidateToDeal(candidate, watch.id);
          const prev = previousById.get(mapped.id);
          nextDeals.push(candidateToDeal(candidate, watch.id, prev));
        }
      }

      // Dedupe by listing id — keep highest net profit
      const byId = new Map<string, Deal>();
      for (const deal of nextDeals) {
        const existing = byId.get(deal.id);
        if (!existing || deal.netProfit > existing.netProfit) {
          byId.set(deal.id, deal);
        }
      }
      const merged = [...byId.values()].sort((a, b) => b.netProfit - a.netProfit);

      const checkedAt = new Date().toISOString();
      const summary: CheckSummary = {
        checkedWatches: active.length,
        dealCount: merged.length,
        message:
          merged.length === 0
            ? active.length === 0
              ? 'Add an active watch, then pull to check eBay.'
              : `Checked ${active.length} watch${active.length === 1 ? '' : 'es'} — no strong deals right now. Quiet is good.`
            : `Found ${merged.length} deal${merged.length === 1 ? '' : 's'} across ${active.length} watch${active.length === 1 ? '' : 'es'}.`,
      };

      setDeals(merged);
      setLastDealCheckAt(checkedAt);
      setLastCheckSummary(summary);
      await Promise.all([saveDeals(merged), saveLastDealCheck(checkedAt)]);
      return summary;
    } finally {
      setRefreshingDeals(false);
    }
  }, [watches, deals]);

  const resetDemo = useCallback(async () => {
    await resetDemoData();
    const [s, w, d, lastCheck] = await Promise.all([
      loadSettings(),
      loadWatches(),
      loadDeals(),
      loadLastDealCheck(),
    ]);
    setSettings(s);
    setWatches(w);
    setDeals(d);
    setLastDealCheckAt(lastCheck);
    setLastCheckSummary(null);
  }, []);

  const value = useMemo<SnaglyStore | null>(() => {
    if (!settings) return null;
    return {
      ready,
      settings,
      watches,
      deals,
      unreadDealCount: deals.filter((d) => !d.seen).length,
      refreshingDeals,
      lastDealCheckAt,
      lastCheckSummary,
      updateSettings,
      addWatch,
      updateWatch,
      deleteWatch,
      markDealSeen,
      refreshDeals,
      resetDemo,
    };
  }, [
    ready,
    settings,
    watches,
    deals,
    refreshingDeals,
    lastDealCheckAt,
    lastCheckSummary,
    updateSettings,
    addWatch,
    updateWatch,
    deleteWatch,
    markDealSeen,
    refreshDeals,
    resetDemo,
  ]);

  if (!value || !ready) {
    return null;
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSnagly() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useSnagly must be used within SnaglyProvider');
  }
  return ctx;
}
