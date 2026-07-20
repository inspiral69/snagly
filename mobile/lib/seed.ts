import type { Deal, Watch } from '@/types/models';
import { estimateNetProfit, percentBelowMarket } from '@/lib/profit';

const now = Date.now();

export const SEED_WATCHES: Watch[] = [
  {
    id: 'watch-sw-200p',
    title: 'Sky-Watcher 200P Explorer',
    notes: 'OTA or full kit OK. Prefer collimation notes / photos of mirror.',
    keywords: 'Sky-Watcher 200P Explorer',
    marketplace: 'ebay_uk',
    active: true,
    minProfitGbp: 40,
    createdAt: new Date(now - 86400000 * 5).toISOString(),
    updatedAt: new Date(now - 86400000 * 2).toISOString(),
  },
  {
    id: 'watch-celestron-c8',
    title: 'Celestron C8 OTA',
    notes: 'Classic C8 or EdgeHD. Check corrector plate condition.',
    keywords: 'Celestron C8 OTA',
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
  const shippingOut = partial.shippingOut ?? 25;
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
    watchId: 'watch-sw-200p',
    title: 'Sky-Watcher Explorer 200P — OTA, clean mirrors',
    buyPrice: 185,
    estResale: 265,
    confidence: 'high',
    why: [
      'Well below recent sold comps',
      'Mirrors look clean in photos',
      'Strong demand on eBay UK',
      'Trusted seller history',
    ],
    explanation:
      'Recent UK solds for tidy 200P OTAs sit around £250–£280. This ask is clearly under that band after fees and postage.',
    hoursAgo: 1.5,
    listingPath: 'sample-sw-200p',
  }),
  makeDeal({
    id: 'deal-2',
    watchId: 'watch-celestron-c8',
    title: 'Celestron C8 OTA — classic orange',
    buyPrice: 420,
    estResale: 560,
    confidence: 'medium',
    why: [
      'Below average sold price',
      'Corrector looks clear',
      'Fast-moving scope in niche',
    ],
    explanation:
      'Similar classic C8 OTAs have been selling near £540–£580. Condition looks solid; confidence is medium until photos are verified.',
    hoursAgo: 4,
    listingPath: 'sample-celestron-c8',
  }),
  makeDeal({
    id: 'deal-3',
    watchId: 'watch-sw-200p',
    title: 'Sky-Watcher 200P — full kit, older mount',
    buyPrice: 220,
    estResale: 310,
    confidence: 'medium',
    why: [
      'Priced under complete-kit sold comps',
      'Mount age disclosed',
    ],
    explanation:
      'Full kits trade higher than OTA-only. Still room for profit if optics match the listing photos; mount may be the weak link.',
    hoursAgo: 9,
    seen: true,
    listingPath: 'sample-sw-200p-kit',
  }),
];
