import { searchListings } from "./browse";
import { resolveTelescopesCategoryId } from "./taxonomy";
import { searchSoldComps, type SoldComp } from "./insights";
import { searchSoldViaSerpApi } from "./serpapi";
import { summarizeFairValue, type FairValue } from "./fairValue";
import type { Env } from "../types";

export type { FairValue };

export type CompsResponse = {
  ok: true;
  keywords: string;
  niche: "telescopes";
  marketplace: "ebay_uk";
  /** True solds (SerpApi/Insights), or active asks as last-resort proxy */
  source: "serpapi_sold" | "marketplace_insights" | "active_asks_proxy";
  insightsAvailable: boolean;
  insightsMessage?: string;
  serpapiMessage?: string;
  fairValue: FairValue | null;
  comps: SoldComp[];
};

let cachedCategoryId: string | null | undefined;

export async function getComps(
  env: Env,
  keywords: string,
  limit = 30,
): Promise<CompsResponse> {
  const q = keywords.trim();
  if (!q) {
    throw new Error("keywords required");
  }

  let serpapiMessage: string | undefined;

  // 1) SerpApi sold listings (practical path for MVP)
  if (env.SERPAPI_API_KEY?.trim()) {
    const serp = await searchSoldViaSerpApi(env, { keywords: q, limit });
    if (serp.ok && serp.comps.length > 0) {
      return {
        ok: true,
        keywords: q,
        niche: "telescopes",
        marketplace: "ebay_uk",
        source: "serpapi_sold",
        insightsAvailable: false,
        fairValue: summarizeFairValue(serp.comps, q),
        comps: serp.comps,
      };
    }
    serpapiMessage = serp.ok
      ? "SerpApi returned 0 sold rows for this query."
      : serp.reason;
    console.warn("SerpApi comps:", serpapiMessage);
  } else {
    serpapiMessage = "SERPAPI_API_KEY not set on worker";
  }

  if (cachedCategoryId === undefined) {
    cachedCategoryId = await resolveTelescopesCategoryId(env);
  }

  // 2) Official Marketplace Insights (usually unavailable)
  const insights = await searchSoldComps(env, {
    keywords: q,
    categoryId: cachedCategoryId,
    limit,
  });

  if (insights.ok && insights.comps.length > 0) {
    return {
      ok: true,
      keywords: q,
      niche: "telescopes",
      marketplace: "ebay_uk",
      source: "marketplace_insights",
      insightsAvailable: true,
      fairValue: summarizeFairValue(insights.comps, q),
      comps: insights.comps,
    };
  }

  // 3) Last resort: current asks — clearly labeled
  const live = await searchListings(env, { keywords: q, limit });
  const proxyComps: SoldComp[] = live.items.map((item) => ({
    title: item.title,
    soldPrice: item.price,
    soldAt: null,
    condition: item.condition,
    url: item.url,
  }));

  return {
    ok: true,
    keywords: q,
    niche: "telescopes",
    marketplace: "ebay_uk",
    source: "active_asks_proxy",
    insightsAvailable: false,
    insightsMessage: insights.ok
      ? "No sold rows from Insights; SerpApi unavailable or empty."
      : insights.reason,
    serpapiMessage,
    fairValue: summarizeFairValue(proxyComps, q),
    comps: proxyComps,
  };
}
