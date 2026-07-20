import type { SoldComp } from "./insights";
import type { Env } from "../types";

const SERPAPI_URL = "https://serpapi.com/search.json";
/** eBay UK telescopes category (same as Browse Taxonomy resolution). */
const TELESCOPES_CATEGORY_ID = "74927";

type SerpPrice = {
  raw?: string;
  extracted?: number;
  from?: { raw?: string; extracted?: number };
  to?: { raw?: string; extracted?: number };
};

type SerpOrganicResult = {
  title?: string;
  link?: string;
  condition?: string;
  sold_date?: string;
  price?: SerpPrice;
};

type SerpResponse = {
  organic_results?: SerpOrganicResult[];
  error?: string;
  search_metadata?: { status?: string };
  search_parameters?: Record<string, string>;
};

export type SerpApiResult =
  | { ok: true; comps: SoldComp[]; total: number }
  | { ok: false; reason: string };

/** Sold comps via SerpApi eBay Search (show_only=Sold, ebay.co.uk). */
export async function searchSoldViaSerpApi(
  env: Env,
  opts: { keywords: string; limit?: number },
): Promise<SerpApiResult> {
  const apiKey = env.SERPAPI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "SERPAPI_API_KEY not configured" };
  }

  const keywords = opts.keywords.trim();
  if (!keywords) {
    return { ok: false, reason: "keywords required" };
  }

  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 50);
  const pageSize = limit <= 25 ? "25" : "50";

  // Try category-scoped first, then keyword-only if empty.
  const attempts: { categoryId?: string }[] = [
    { categoryId: TELESCOPES_CATEGORY_ID },
    {},
  ];

  let lastReason = "SerpApi returned no usable sold rows";

  for (const attempt of attempts) {
    const result = await runSerpSearch(apiKey, {
      keywords,
      pageSize,
      categoryId: attempt.categoryId,
    });

    if (!result.ok) {
      lastReason = result.reason;
      continue;
    }

    const comps = result.comps.slice(0, limit);
    if (comps.length > 0) {
      return { ok: true, comps, total: comps.length };
    }
    lastReason = `SerpApi returned 0 parsable sold prices (organic=${result.rawCount})`;
  }

  return { ok: false, reason: lastReason };
}

async function runSerpSearch(
  apiKey: string,
  opts: { keywords: string; pageSize: string; categoryId?: string },
): Promise<
  | { ok: true; comps: SoldComp[]; rawCount: number }
  | { ok: false; reason: string }
> {
  const url = new URL(SERPAPI_URL);
  url.searchParams.set("engine", "ebay");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("_nkw", opts.keywords);
  url.searchParams.set("ebay_domain", "ebay.co.uk");
  url.searchParams.set("show_only", "Sold");
  url.searchParams.set("_ipg", opts.pageSize);
  if (opts.categoryId) {
    url.searchParams.set("category_id", opts.categoryId);
  }

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json" },
  });

  const text = await res.text();
  let data: SerpResponse;
  try {
    data = JSON.parse(text) as SerpResponse;
  } catch {
    return { ok: false, reason: `SerpApi returned non-JSON (${res.status})` };
  }

  if (!res.ok || data.error) {
    return {
      ok: false,
      reason: data.error || `SerpApi failed (${res.status}): ${text.slice(0, 240)}`,
    };
  }

  const organic = data.organic_results ?? [];
  const comps = organic
    .map(mapResult)
    .filter((c): c is SoldComp => c !== null);

  return { ok: true, comps, rawCount: organic.length };
}

function mapResult(raw: SerpOrganicResult): SoldComp | null {
  if (!raw.title) return null;

  const soldPrice = extractPrice(raw.price);
  if (soldPrice == null || !Number.isFinite(soldPrice) || soldPrice <= 0) {
    return null;
  }

  return {
    title: raw.title,
    soldPrice,
    soldAt: raw.sold_date ?? null,
    condition: raw.condition ?? null,
    url: raw.link ?? null,
  };
}

function extractPrice(price?: SerpPrice): number | null {
  if (!price) return null;
  if (typeof price.extracted === "number") return price.extracted;
  if (typeof price.from?.extracted === "number") return price.from.extracted;
  if (price.raw) return parseGbp(price.raw);
  if (price.from?.raw) return parseGbp(price.from.raw);
  return null;
}

function parseGbp(raw?: string): number | null {
  if (!raw) return null;
  // Handles £1,234.56 / GBP 1234.56 / 1234.56
  const cleaned = raw.replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}
