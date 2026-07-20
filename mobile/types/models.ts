export type Marketplace = 'ebay_uk';

export type Niche = 'telescopes';

export type Confidence = 'low' | 'medium' | 'high';

export interface UserSettings {
  displayName: string;
  /** Marketplace fee as % of sale price (e.g. 12.9 for eBay UK typical) */
  defaultFeePercent: number;
  /** Fixed fee component in GBP */
  defaultFeeFixed: number;
  /** Typical outbound shipping cost in GBP when you resell */
  defaultShippingOut: number;
  /** Alert only if est. net profit >= this */
  minProfitGbp: number;
  /** Alert only if ROI % >= this */
  minRoiPercent: number;
  niche: Niche;
}

export interface Watch {
  id: string;
  title: string;
  /** Free-text notes: boxed, finder, dust cover, OTA only vs full kit, etc. */
  notes: string;
  keywords: string;
  marketplace: Marketplace;
  active: boolean;
  minProfitGbp: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  watchId: string | null;
  title: string;
  marketplace: Marketplace;
  listingUrl: string;
  imageUrl: string | null;
  buyPrice: number;
  estResale: number;
  fees: number;
  shippingIn: number;
  shippingOut: number;
  netProfit: number;
  roiPercent: number;
  percentBelowMarket: number;
  confidence: Confidence;
  why: string[];
  explanation: string;
  listedAt: string;
  seen: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'You',
  defaultFeePercent: 12.9,
  defaultFeeFixed: 0.3,
  defaultShippingOut: 6,
  minProfitGbp: 25,
  minRoiPercent: 15,
  niche: 'telescopes',
};
