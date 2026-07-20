import { getAppAccessToken } from "./auth";
import { resolveTelescopesCategoryId } from "./taxonomy";
import type { EbayListing, Env } from "../types";

const BROWSE_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

/** Cached taxonomy-resolved category for this isolate. */
let cachedCategoryId: string | null | undefined;

type BrowseItemSummary = {
  itemId?: string;
  title?: string;
  itemWebUrl?: string;
  condition?: string;
  itemCreationDate?: string;
  price?: { value?: string; currency?: string };
  image?: { imageUrl?: string };
  thumbnailImages?: { imageUrl?: string }[];
  shippingOptions?: {
    shippingCost?: { value?: string; currency?: string };
  }[];
  seller?: { username?: string };
  categories?: { categoryId?: string; categoryName?: string }[];
};

type BrowseSearchResponse = {
  itemSummaries?: BrowseItemSummary[];
  total?: number;
};

export type SearchParams = {
  keywords: string;
  limit?: number;
};

const JUNK_TITLE =
  /\b(antenna|aerial|radio|ear\s*muffs?|power\s*supply|ac\s*adapter|adapter|cable|mounting\s*the)\b/i;

export async function searchListings(
  env: Env,
  params: SearchParams,
): Promise<{ items: EbayListing[]; total: number; categoryId: string | null }> {
  const keywords = params.keywords.trim();
  if (!keywords) {
    throw new Error("keywords required");
  }

  const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
  const token = await getAppAccessToken(env);

  if (cachedCategoryId === undefined) {
    cachedCategoryId = await resolveTelescopesCategoryId(env);
  }
  const categoryId = cachedCategoryId;

  const result = await runSearch(token, {
    keywords,
    limit: Math.min(limit * 2, 50), // over-fetch then filter junk
    categoryId: categoryId ?? undefined,
    filter: "buyingOptions:{FIXED_PRICE|AUCTION}",
  });

  const cleaned = result.items.filter((item) => !JUNK_TITLE.test(item.title));
  const items = cleaned.slice(0, limit);

  // If category scoped search was empty, try keywords that bias to scopes
  if (items.length === 0) {
    const fallback = await runSearch(token, {
      keywords: `${keywords} OTA reflector refractor`,
      limit: Math.min(limit * 2, 50),
      filter: "buyingOptions:{FIXED_PRICE|AUCTION}",
    });
    const fallbackClean = fallback.items
      .filter((item) => !JUNK_TITLE.test(item.title))
      .slice(0, limit);
    return {
      items: fallbackClean,
      total: fallback.total,
      categoryId,
    };
  }

  return { items, total: result.total, categoryId };
}

async function runSearch(
  token: string,
  opts: {
    keywords: string;
    limit: number;
    categoryId?: string;
    filter?: string;
  },
): Promise<{ items: EbayListing[]; total: number }> {
  const url = new URL(BROWSE_SEARCH_URL);
  url.searchParams.set("q", opts.keywords);
  url.searchParams.set("limit", String(opts.limit));
  url.searchParams.set("sort", "newlyListed");
  if (opts.categoryId) {
    url.searchParams.set("category_ids", opts.categoryId);
  }
  if (opts.filter) {
    url.searchParams.set("filter", opts.filter);
  }

  const res = await fetch(url.toString(), {
    headers: {
      authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB",
      "Accept-Language": "en-GB",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 400 || res.status === 404) {
      console.warn(`Browse search soft-fail (${res.status}): ${text.slice(0, 200)}`);
      return { items: [], total: 0 };
    }
    throw new Error(`eBay Browse search failed (${res.status}): ${text.slice(0, 400)}`);
  }

  const data = (await res.json()) as BrowseSearchResponse;
  const items = (data.itemSummaries ?? [])
    .map(mapItem)
    .filter((item): item is EbayListing => item !== null);

  return { items, total: data.total ?? items.length };
}

function mapItem(raw: BrowseItemSummary): EbayListing | null {
  const priceValue = Number.parseFloat(raw.price?.value ?? "");
  if (!raw.itemId || !raw.title || !Number.isFinite(priceValue)) {
    return null;
  }

  const currency = raw.price?.currency ?? "GBP";
  if (currency !== "GBP") {
    return null;
  }

  const shippingRaw = raw.shippingOptions?.[0]?.shippingCost?.value;
  const shippingCost = shippingRaw != null ? Number.parseFloat(shippingRaw) : 0;
  const imageUrl =
    raw.image?.imageUrl ?? raw.thumbnailImages?.[0]?.imageUrl ?? null;

  return {
    itemId: raw.itemId,
    title: raw.title,
    price: priceValue,
    currency: "GBP",
    url: raw.itemWebUrl ?? `https://www.ebay.co.uk/itm/${raw.itemId}`,
    imageUrl,
    condition: raw.condition ?? null,
    shippingCost: Number.isFinite(shippingCost) ? shippingCost : 0,
    sellerUsername: raw.seller?.username ?? "unknown",
    listedAt: raw.itemCreationDate ?? null,
  };
}
