/**
 * eBay UK listing ingest — Phase 0 stub.
 *
 * Phase 1 will swap this for Browse / Finding API calls + sold comps.
 * Keep marketplace access behind this module so UI stays unaware of sources.
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

export type IngestQuery = {
  keywords: string;
  niche: 'cameras';
  limit?: number;
};

/** Placeholder search — returns empty until API keys + Phase 1 engine land. */
export async function searchLiveListings(
  _query: IngestQuery,
): Promise<EbayListingStub[]> {
  await delay(200);
  return [];
}

/** Placeholder sold comps fetch. */
export async function fetchSoldComps(
  _query: IngestQuery,
): Promise<{ title: string; soldPrice: number; soldAt: string }[]> {
  await delay(200);
  return [];
}

export function buildEbaySearchUrl(keywords: string): string {
  const q = encodeURIComponent(keywords.trim());
  return `https://www.ebay.co.uk/sch/i.html?_nkw=${q}&_sacat=0&LH_ItemCondition=3000|4000|5000&rt=nc&LH_PrefLoc=1`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
