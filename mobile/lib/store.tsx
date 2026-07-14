import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Deal, UserSettings, Watch } from '@/types/models';
import {
  ensureSeedData,
  loadDeals,
  loadSettings,
  loadWatches,
  resetDemoData,
  saveDeals,
  saveSettings,
  saveWatches,
} from '@/lib/storage';

type SnaglyStore = {
  ready: boolean;
  settings: UserSettings;
  watches: Watch[];
  deals: Deal[];
  unreadDealCount: number;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  addWatch: (input: Omit<Watch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Watch>;
  updateWatch: (id: string, patch: Partial<Watch>) => Promise<void>;
  deleteWatch: (id: string) => Promise<void>;
  markDealSeen: (id: string) => Promise<void>;
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureSeedData();
      const [s, w, d] = await Promise.all([loadSettings(), loadWatches(), loadDeals()]);
      if (cancelled) return;
      setSettings(s);
      setWatches(w);
      setDeals(d);
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

  const resetDemo = useCallback(async () => {
    await resetDemoData();
    const [s, w, d] = await Promise.all([loadSettings(), loadWatches(), loadDeals()]);
    setSettings(s);
    setWatches(w);
    setDeals(d);
  }, []);

  const value = useMemo<SnaglyStore | null>(() => {
    if (!settings) return null;
    return {
      ready,
      settings,
      watches,
      deals,
      unreadDealCount: deals.filter((d) => !d.seen).length,
      updateSettings,
      addWatch,
      updateWatch,
      deleteWatch,
      markDealSeen,
      resetDemo,
    };
  }, [
    ready,
    settings,
    watches,
    deals,
    updateSettings,
    addWatch,
    updateWatch,
    deleteWatch,
    markDealSeen,
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
