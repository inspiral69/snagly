export type Env = {
  EBAY_VERIFICATION_TOKEN: string;
  EBAY_NOTIFICATION_PATH: string;
  EBAY_CLIENT_ID: string;
  EBAY_CLIENT_SECRET: string;
  EBAY_DEV_ID?: string;
  /** Optional shared secret for app → API calls */
  SNAGLY_API_KEY?: string;
  /** SerpApi key for eBay UK sold comps */
  SERPAPI_API_KEY?: string;
};

export type EbayListing = {
  itemId: string;
  title: string;
  price: number;
  currency: "GBP";
  url: string;
  imageUrl: string | null;
  condition: string | null;
  shippingCost: number;
  sellerUsername: string;
  listedAt: string | null;
};
