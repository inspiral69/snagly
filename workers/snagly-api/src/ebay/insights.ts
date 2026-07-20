import { getAppAccessToken, INSIGHTS_SCOPE } from "./auth";
import type { Env } from "../types";

export type SoldComp = {
  title: string;
  soldPrice: number;
  soldAt: string | null;
  condition: string | null;
  url: string | null;
};

export type InsightsResult =
  | { ok: true; comps: SoldComp[]; total: number }
  | { ok: false; status: number; reason: string };

const ENDPOINTS = [
  "https://api.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search",
  "https://api.ebay.com/buy/marketplace_insights/v1/item_sales/search",
];

type InsightsItem = {
  title?: string;
  itemWebUrl?: string;
  condition?: string;
  lastSoldDate?: string;
  price?: { value?: string; currency?: string };
};

type InsightsResponse = {
  itemSales?: InsightsItem[];
  total?: number;
  errors?: { message?: string; errorId?: number }[];
};

/** Search sold listings via Marketplace Insights (gated API). */
export async function searchSoldComps(
  env: Env,
  opts: { keywords: string; categoryId?: string | null; limit?: number },
): Promise<InsightsResult> {
  let token: string;
  try {
    token = await getAppAccessToken(env, INSIGHTS_SCOPE);
  } catch (error) {
    return {
      ok: false,
      status: 403,
      reason:
        error instanceof Error
          ? error.message
          : "Could not obtain Insights OAuth token",
    };
  }

  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 50);
  let lastStatus = 0;
  let lastBody = "";

  for (const endpoint of ENDPOINTS) {
    const url = new URL(endpoint);
    url.searchParams.set("q", opts.keywords);
    url.searchParams.set("limit", String(limit));
    if (opts.categoryId) {
      url.searchParams.set("category_ids", opts.categoryId);
    }

    const res = await fetch(url.toString(), {
      headers: {
        authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB",
        "Accept-Language": "en-GB",
      },
    });

    const text = await res.text();
    lastStatus = res.status;
    lastBody = text;

    if (res.status === 403 || res.status === 401) {
      return {
        ok: false,
        status: res.status,
        reason:
          "Marketplace Insights access not granted for this app. Apply in the eBay Developer Program.",
      };
    }

    if (!res.ok) {
      // Try alternate path / continue
      console.warn(`Insights ${endpoint} failed (${res.status}): ${text.slice(0, 200)}`);
      continue;
    }

    let data: InsightsResponse;
    try {
      data = JSON.parse(text) as InsightsResponse;
    } catch {
      continue;
    }

    const comps = (data.itemSales ?? [])
      .map(mapSale)
      .filter((c): c is SoldComp => c !== null);

    return { ok: true, comps, total: data.total ?? comps.length };
  }

  return {
    ok: false,
    status: lastStatus || 502,
    reason: lastBody.slice(0, 300) || "Marketplace Insights request failed",
  };
}

function mapSale(raw: InsightsItem): SoldComp | null {
  const soldPrice = Number.parseFloat(raw.price?.value ?? "");
  if (!raw.title || !Number.isFinite(soldPrice)) return null;
  if (raw.price?.currency && raw.price.currency !== "GBP") return null;

  return {
    title: raw.title,
    soldPrice,
    soldAt: raw.lastSoldDate ?? null,
    condition: raw.condition ?? null,
    url: raw.itemWebUrl ?? null,
  };
}
