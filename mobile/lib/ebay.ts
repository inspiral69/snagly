/**
 * eBay UK listing ingest — live search, comps, and scored deals via snagly-api.
 *
 * Secrets stay on the Worker; the app only calls our API.
 * Launch niche: telescopes on eBay UK.
 */

export type EbayListingStub = {
  itemId: string;
  title: string;
  price: number;
  currency: 'GBP';
  url: string;
  imageUrl: string | null;
  condition: string | null;
  shippingCost: number;
  sellerUsername: string;
  listedAt: string;
};

export type SoldComp = {
  title: string;
  soldPrice: number;
  soldAt: string | null;
  condition: string | null;
  url: string | null;
};

export type FairValue = {
  currency: 'GBP';
  sampleSize: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  excludedCount?: number;
};

export type CompsResult = {
  source: 'serpapi_sold' | 'marketplace_insights' | 'active_asks_proxy';
  insightsAvailable: boolean;
  insightsMessage?: string;
  fairValue: FairValue | null;
  comps: SoldComp[];
};

export type DealCandidate = {
  itemId: string;
  title: string;
  buyPrice: number;
  currency: 'GBP';
  url: string;
  imageUrl: string | null;
  condition: string | null;
  shippingIn: number;
  shippingOut: number;
  sellerUsername: string;
  listedAt: string | null;
  estResale: number;
  fees: number;
  netProfit: number;
  roiPercent: number;
  percentBelowMarket: number;
  confidence: 'low' | 'medium' | 'high';
  why: string[];
  explanation: string;
};

export type DealsResult = {
  compsSource: 'serpapi_sold' | 'marketplace_insights' | 'active_asks_proxy';
  fairValue: FairValue | null;
  assumptions: {
    feePercent: number;
    feeFixed: number;
    shippingOut: number;
  };
  deals: DealCandidate[];
  candidates?: DealCandidate[];
};

export type IngestQuery = {
  keywords: string;
  niche: 'telescopes';
  limit?: number;
};

const API_BASE =
  process.env.EXPO_PUBLIC_SNAGLY_API_URL?.replace(/\/$/, '') ||
  'https://snagly-api.p2apps.com';

type SearchResponse = {
  ok?: boolean;
  items?: EbayListingStub[];
  total?: number;
  error?: string;
  message?: string;
};

/** Live telescope search on eBay UK via snagly-api. */
export async function searchLiveListings(
  query: IngestQuery,
): Promise<EbayListingStub[]> {
  const keywords = query.keywords.trim();
  if (!keywords) return [];

  const limit = query.limit ?? 20;
  const url = new URL(`${API_BASE}/v1/ebay/search`);
  url.searchParams.set('q', keywords);
  url.searchParams.set('limit', String(limit));

  const data = await apiGet<SearchResponse>(url);
  return (data.items ?? []).map((item) => ({
    ...item,
    listedAt: item.listedAt || new Date().toISOString(),
  }));
}

/**
 * Sold comps + fair value.
 * Prefers SerpApi solds, then Insights, then active-asks proxy.
 */
export async function fetchSoldComps(query: IngestQuery): Promise<CompsResult> {
  const keywords = query.keywords.trim();
  if (!keywords) {
    return {
      source: 'active_asks_proxy',
      insightsAvailable: false,
      fairValue: null,
      comps: [],
    };
  }

  const limit = query.limit ?? 30;
  const url = new URL(`${API_BASE}/v1/ebay/comps`);
  url.searchParams.set('q', keywords);
  url.searchParams.set('limit', String(limit));

  return apiGet<CompsResult>(url);
}

/**
 * Live listings scored against cleaned sold comps → net profit / ROI / confidence.
 * Uses 1 SerpApi search (via comps) + eBay Browse live search.
 */
export async function fetchDealCandidates(
  query: IngestQuery,
): Promise<DealsResult> {
  const keywords = query.keywords.trim();
  if (!keywords) {
    return {
      compsSource: 'active_asks_proxy',
      fairValue: null,
      assumptions: { feePercent: 12.9, feeFixed: 0.3, shippingOut: 25 },
      deals: [],
    };
  }

  const limit = query.limit ?? 15;
  const url = new URL(`${API_BASE}/v1/ebay/deals`);
  url.searchParams.set('q', keywords);
  url.searchParams.set('limit', String(limit));

  return apiGet<DealsResult>(url);
}

export function buildEbaySearchUrl(keywords: string): string {
  const q = encodeURIComponent(keywords.trim());
  // Category 74927 = Telescopes on eBay UK (resolved via Taxonomy API)
  return `https://www.ebay.co.uk/sch/74927/i.html?_nkw=${q}&LH_ItemCondition=3000|4000|5000&rt=nc&LH_PrefLoc=1`;
}

async function apiGet<T>(url: URL): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const apiKey = process.env.EXPO_PUBLIC_SNAGLY_API_KEY?.trim();
  if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  const res = await fetch(url.toString(), { headers });
  const data = (await res.json()) as T & { error?: string; message?: string };

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  return data;
}
