import type { SoldComp } from "./insights";

export type FairValue = {
  currency: "GBP";
  sampleSize: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  excludedCount: number;
};

const JUNK_COMP =
  /\b(parts?\s*only|for\s*parts|spares|not\s*working|faulty|broken|untested|antenna|aerial|radio|stand\s*only|base\s*only|bezel|trim\s*ring|main\s*mirror|mirror\s*only|tube\s*only)\b/i;

const ACCESSORY_ONLY =
  /\b(eyepiece|diagonal|barlow|filter(?!\s*wheel)|shroud|dew\s*shield|finderscope|finder\s*scope|adapter|extension|tube\s*rings?|dovetail|case\s*only|bag\s*only|cover\s*only|cap\s*only|manual\s*only|power\s*supply|handset)\b/i;

/** Prefer complete telescope / OTA solds over bits. */
const SCOPE_SIGNAL =
  /\b(telescope|ota|dobsonian|newtonian|refractor|reflector|skyliner|explorer|flextube|schmitt|cassegrain|mak\b|maksutov)\b/i;

/** Drop parts-only / accessories / irrelevant titles and extreme outliers. */
export function cleanCompsForFairValue(
  comps: SoldComp[],
  keywords?: string,
): {
  kept: SoldComp[];
  excludedCount: number;
} {
  const tokens = modelTokens(keywords ?? "");

  let nonJunk = comps.filter((c) => isPlausibleScopeComp(c, tokens));

  // If too strict, relax model token requirement but keep junk/accessory filters
  if (nonJunk.length < 5) {
    nonJunk = comps.filter((c) => isPlausibleScopeComp(c, []));
  }

  if (nonJunk.length < 3) {
    return {
      kept: nonJunk,
      excludedCount: comps.length - nonJunk.length,
    };
  }

  const prices = nonJunk.map((c) => c.soldPrice).sort((a, b) => a - b);
  const q1 = quantile(prices, 0.25);
  const q3 = quantile(prices, 0.75);
  const iqr = Math.max(q3 - q1, 1);
  const low = Math.max(q1 - 1.5 * iqr, 100); // full telescope comps below £100 are usually incomplete
  const high = q3 + 1.5 * iqr;

  const kept = nonJunk.filter((c) => c.soldPrice >= low && c.soldPrice <= high);
  return {
    kept: kept.length >= 3 ? kept : nonJunk.filter((c) => c.soldPrice >= 100),
    excludedCount:
      comps.length -
      (kept.length >= 3
        ? kept.length
        : nonJunk.filter((c) => c.soldPrice >= 100).length),
  };
}

function isPlausibleScopeComp(c: SoldComp, tokens: string[]): boolean {
  const title = c.title ?? "";
  if (!title) return false;
  if (JUNK_COMP.test(title)) return false;
  if (ACCESSORY_ONLY.test(title)) return false;
  if (c.soldPrice < 50) return false;
  if (tokens.length && !matchesModel(title, tokens)) return false;
  // Prefer titles that look like actual scopes; allow through if model tokens matched
  if (!SCOPE_SIGNAL.test(title) && tokens.length === 0) return false;
  if (!SCOPE_SIGNAL.test(title) && tokens.length > 0) {
    // Model matched but no scope words — keep only if price looks like a full OTA/kit
    if (c.soldPrice < 120) return false;
  }
  return true;
}

export function summarizeFairValue(
  comps: SoldComp[],
  keywords?: string,
): FairValue | null {
  const { kept, excludedCount } = cleanCompsForFairValue(comps, keywords);
  if (!kept.length) return null;

  const prices = kept.map((c) => c.soldPrice).sort((a, b) => a - b);
  return {
    currency: "GBP",
    sampleSize: prices.length,
    median: quantile(prices, 0.5),
    p25: quantile(prices, 0.25),
    p75: quantile(prices, 0.75),
    min: prices[0],
    max: prices[prices.length - 1],
    excludedCount,
  };
}

/** Pull model-ish tokens: alphanumerics with a digit, length >= 3 (e.g. 200P, EQ5). */
export function modelTokens(keywords: string): string[] {
  return keywords
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((t) => t.length >= 3 && /\d/.test(t));
}

export function matchesModel(title: string, tokens: string[]): boolean {
  const t = title.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  return tokens.every((token) => t.includes(token.replace(/[^A-Z0-9]+/g, "")));
}

export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 1) return round2(sorted[0]);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1] ?? sorted[base];
  return round2(sorted[base] + rest * (next - sorted[base]));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isJunkListingTitle(title: string): boolean {
  return JUNK_COMP.test(title) || ACCESSORY_ONLY.test(title);
}
