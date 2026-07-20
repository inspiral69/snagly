import { searchListings } from "./browse";
import { getComps } from "./comps";
import {
  isJunkListingTitle,
  matchesModel,
  modelTokens,
  summarizeFairValue,
  type FairValue,
  round2,
} from "./fairValue";
import type { EbayListing, Env } from "../types";

export type DealCandidate = {
  itemId: string;
  title: string;
  buyPrice: number;
  currency: "GBP";
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
  confidence: "low" | "medium" | "high";
  why: string[];
  explanation: string;
};

export type DealsResponse = {
  ok: true;
  keywords: string;
  niche: "telescopes";
  marketplace: "ebay_uk";
  compsSource: "serpapi_sold" | "marketplace_insights" | "active_asks_proxy";
  fairValue: FairValue | null;
  assumptions: {
    feePercent: number;
    feeFixed: number;
    shippingOut: number;
  };
  deals: DealCandidate[];
  candidates: DealCandidate[];
  debug?: {
    liveCount: number;
    scoredCount: number;
    tokens: string[];
  };
};

const DEFAULT_FEE_PERCENT = 12.9;
const DEFAULT_FEE_FIXED = 0.3;
const DEFAULT_SHIPPING_OUT = 25;

export async function getDeals(
  env: Env,
  keywords: string,
  limit = 15,
): Promise<DealsResponse> {
  const q = keywords.trim();
  if (!q) throw new Error("keywords required");

  const tokens = modelTokens(q);

  const [comps, live] = await Promise.all([
    getComps(env, q, 40),
    searchListings(env, {
      keywords: q,
      limit: Math.min(Math.max(limit * 2, 20), 40),
    }),
  ]);

  const fairValue = summarizeFairValue(comps.comps, q);
  const assumptions = {
    feePercent: DEFAULT_FEE_PERCENT,
    feeFixed: DEFAULT_FEE_FIXED,
    shippingOut: DEFAULT_SHIPPING_OUT,
  };

  if (!fairValue) {
    return {
      ok: true,
      keywords: q,
      niche: "telescopes",
      marketplace: "ebay_uk",
      compsSource: comps.source,
      fairValue: null,
      assumptions,
      deals: [],
      candidates: [],
      debug: { liveCount: live.items.length, scoredCount: 0, tokens },
    };
  }

  const scored = live.items
    .filter((item) => !isJunkListingTitle(item.title))
    .filter((item) => (tokens.length ? matchesModel(item.title, tokens) : true))
    .map((item) => scoreListing(item, fairValue, assumptions))
    .sort((a, b) => b.netProfit - a.netProfit);

  return {
    ok: true,
    keywords: q,
    niche: "telescopes",
    marketplace: "ebay_uk",
    compsSource: comps.source,
    fairValue,
    assumptions,
    deals: scored.filter((d) => d.netProfit > 0).slice(0, limit),
    candidates: scored.slice(0, limit),
    debug: {
      liveCount: live.items.length,
      scoredCount: scored.length,
      tokens,
    },
  };
}

function scoreListing(
  item: EbayListing,
  fairValue: FairValue,
  assumptions: DealsResponse["assumptions"],
): DealCandidate {
  const buyPrice = item.price;
  const shippingIn = item.shippingCost;
  const shippingOut = assumptions.shippingOut;
  const estResale = fairValue.median;

  const fees = round2(
    (estResale * assumptions.feePercent) / 100 + assumptions.feeFixed,
  );
  const netProfit = round2(
    estResale - buyPrice - fees - shippingIn - shippingOut,
  );
  const invested = buyPrice + shippingIn;
  const roiPercent = invested > 0 ? round2((netProfit / invested) * 100) : 0;
  const percentBelowMarket =
    estResale > 0 ? round2(((estResale - buyPrice) / estResale) * 100) : 0;

  const confidence = scoreConfidence({
    fairValue,
    buyPrice,
    netProfit,
    percentBelowMarket,
    condition: item.condition,
  });

  const why: string[] = [];
  if (percentBelowMarket >= 5) {
    why.push(`${Math.round(percentBelowMarket)}% below recent sold median`);
  }
  if (netProfit >= 25) {
    why.push(`Est. net profit £${Math.round(netProfit)} after fees & shipping`);
  } else if (netProfit <= 0) {
    why.push(
      `Not profitable after fees & shipping (est. £${Math.round(netProfit)})`,
    );
  }
  if (fairValue.sampleSize >= 5) {
    why.push(`Based on ${fairValue.sampleSize} cleaned sold comps`);
  }
  if (item.condition) {
    why.push(`Listed as ${item.condition}`);
  }
  if (why.length === 0) {
    why.push("Compared against recent sold median");
  }

  const explanation =
    `Recent UK solds (cleaned) centre around £${Math.round(fairValue.median)} ` +
    `(typical band £${Math.round(fairValue.p25)}–£${Math.round(fairValue.p75)}). ` +
    `At £${Math.round(buyPrice)} ask` +
    (shippingIn > 0 ? ` + £${round2(shippingIn)} inbound shipping` : "") +
    `, estimated net is £${Math.round(netProfit)} after ~${assumptions.feePercent}% fees and £${shippingOut} outbound postage.`;

  return {
    itemId: item.itemId,
    title: item.title,
    buyPrice,
    currency: "GBP",
    url: item.url,
    imageUrl: item.imageUrl,
    condition: item.condition,
    shippingIn,
    shippingOut,
    sellerUsername: item.sellerUsername,
    listedAt: item.listedAt,
    estResale,
    fees,
    netProfit,
    roiPercent,
    percentBelowMarket,
    confidence,
    why,
    explanation,
  };
}

function scoreConfidence(input: {
  fairValue: FairValue;
  buyPrice: number;
  netProfit: number;
  percentBelowMarket: number;
  condition: string | null;
}): "low" | "medium" | "high" {
  const { fairValue, buyPrice, netProfit, percentBelowMarket, condition } =
    input;
  const cond = (condition ?? "").toLowerCase();
  const riskyCondition =
    cond.includes("parts") ||
    cond.includes("not working") ||
    cond.includes("fault");

  if (riskyCondition || fairValue.sampleSize < 4 || netProfit <= 0) return "low";

  if (
    fairValue.sampleSize >= 8 &&
    buyPrice <= fairValue.p25 &&
    netProfit >= 40 &&
    percentBelowMarket >= 10
  ) {
    return "high";
  }

  if (netProfit >= 20 && percentBelowMarket >= 5) {
    return "medium";
  }

  return "low";
}
