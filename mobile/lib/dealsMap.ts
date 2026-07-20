import type { Deal } from '@/types/models';
import type { DealCandidate } from '@/lib/ebay';

/** Map API deal candidate → app Deal model. */
export function candidateToDeal(
  candidate: DealCandidate,
  watchId: string | null,
  previous?: Deal | null,
): Deal {
  const id = `live-${stableId(candidate.itemId)}`;
  return {
    id,
    watchId,
    title: candidate.title,
    marketplace: 'ebay_uk',
    listingUrl: candidate.url,
    imageUrl: candidate.imageUrl,
    buyPrice: candidate.buyPrice,
    estResale: candidate.estResale,
    fees: candidate.fees,
    shippingIn: candidate.shippingIn,
    shippingOut: candidate.shippingOut,
    netProfit: candidate.netProfit,
    roiPercent: candidate.roiPercent,
    percentBelowMarket: candidate.percentBelowMarket,
    confidence: candidate.confidence,
    why: candidate.why,
    explanation: candidate.explanation,
    listedAt: candidate.listedAt || new Date().toISOString(),
    seen: previous?.seen ?? false,
  };
}

function stableId(itemId: string) {
  return itemId.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}
