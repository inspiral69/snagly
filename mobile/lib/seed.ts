import type { Deal, Watch } from '@/types/models';
import { estimateNetProfit, percentBelowMarket } from '@/lib/profit';

const now = Date.now();

export const SEED_WATCHES: Watch[] = [
  {
    id: 'watch-sony-2470',
    title: 'Sony 24-70 GM II',
    notes: 'Prefer boxed / with hood. Not GM I.',
    keywords: 'Sony FE 24-70mm f/2.8 GM II',
    marketplace: 'ebay_uk',
    active: true,
    minProfitGbp: 40,
    createdAt: new Date(now - 86400000 * 5).toISOString(),
    updatedAt: new Date(now - 86400000 * 2).toISOString(),
  },
  {
    id: 'watch-fuji-xt5',
    title: 'Fujifilm X-T5 body',
    notes: 'Low shutter count if listed. Body only OK.',
    keywords: 'Fujifilm X-T5 body',
    marketplace: 'ebay_uk',
    active: true,
    minProfitGbp: null,
    createdAt: new Date(now - 86400000 * 3).toISOString(),
    updatedAt: new Date(now - 86400000).toISOString(),
  },
];

function makeDeal(partial: {
  id: string;
  watchId: string | null;
  title: string;
  buyPrice: number;
  estResale: number;
  shippingIn?: number;
  shippingOut?: number;
  confidence: Deal['confidence'];
  why: string[];
  explanation: string;
  hoursAgo: number;
  seen?: boolean;
  listingPath: string;
}): Deal {
  const shippingIn = partial.shippingIn ?? 0;
  const shippingOut = partial.shippingOut ?? 6;
  const { fees, netProfit, roiPercent } = estimateNetProfit({
    buyPrice: partial.buyPrice,
    estResale: partial.estResale,
    feePercent: 12.9,
    feeFixed: 0.3,
    shippingIn,
    shippingOut,
  });

  return {
    id: partial.id,
    watchId: partial.watchId,
    title: partial.title,
    marketplace: 'ebay_uk',
    listingUrl: `https://www.ebay.co.uk/itm/${partial.listingPath}`,
    imageUrl: null,
    buyPrice: partial.buyPrice,
    estResale: partial.estResale,
    fees,
    shippingIn,
    shippingOut,
    netProfit,
    roiPercent,
    percentBelowMarket: percentBelowMarket(partial.buyPrice, partial.estResale),
    confidence: partial.confidence,
    why: partial.why,
    explanation: partial.explanation,
    listedAt: new Date(now - partial.hoursAgo * 3600000).toISOString(),
    seen: partial.seen ?? false,
  };
}

export const SEED_DEALS: Deal[] = [
  makeDeal({
    id: 'deal-1',
    watchId: 'watch-sony-2470',
    title: 'Sony FE 24-70mm f/2.8 GM II — mint, boxed',
    buyPrice: 1285,
    estResale: 1680,
    confidence: 'high',
    why: [
      'Well below recent sold comps',
      'Boxed with hood & paperwork',
      'Strong demand on eBay UK',
      'Trusted seller history',
    ],
    explanation:
      'Recent UK solds for boxed mint copies sit around £1,650–£1,720. This ask is clearly under that band after fees and postage.',
    hoursAgo: 1.5,
    listingPath: 'sample-sony-2470',
  }),
  makeDeal({
    id: 'deal-2',
    watchId: 'watch-fuji-xt5',
    title: 'Fujifilm X-T5 body — shutter ~2.1k',
    buyPrice: 980,
    estResale: 1220,
    confidence: 'medium',
    why: [
      'Below average sold price',
      'Low shutter count stated',
      'Fast-moving body in niche',
    ],
    explanation:
      'Similar low-shutter X-T5 bodies have been selling near £1,200. Condition looks solid; confidence is medium until photos are verified.',
    hoursAgo: 4,
    listingPath: 'sample-fuji-xt5',
  }),
  makeDeal({
    id: 'deal-3',
    watchId: 'watch-sony-2470',
    title: 'Sony 24-70 GM II — light marks, no box',
    buyPrice: 1190,
    estResale: 1480,
    confidence: 'medium',
    why: [
      'Priced under unboxed sold comps',
      'Cosmetic notes disclosed',
    ],
    explanation:
      'Unboxed copies trade lower than mint-boxed. Still room for profit if cosmetics match the listing photos.',
    hoursAgo: 9,
    seen: true,
    listingPath: 'sample-sony-2470-unboxed',
  }),
];
