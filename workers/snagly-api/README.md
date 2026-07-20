# snagly-api

Cloudflare Worker on **snagly-api.p2apps.com**.

## eBay Marketplace Account Deletion

Endpoint (paste into eBay Developer Portal → Alerts and Notifications):

```
https://snagly-api.p2apps.com/ebay/marketplace-account-deletion
```

Also set:

- **Alert email** — your contact email (eBay emails you if the endpoint goes down)
- **Verification token** — same value as the `EBAY_VERIFICATION_TOKEN` Worker secret

## eBay deals (fair value + net profit)

```
GET https://snagly-api.p2apps.com/v1/ebay/deals?q=Sky-Watcher%20200P&limit=10
```

Combines SerpApi sold comps (cleaned) with live Browse listings. Returns only candidates with estimated **net profit > 0** after fees + shipping.

Prefers **SerpApi sold listings** (`show_only=Sold`, `ebay.co.uk`) when `SERPAPI_API_KEY` is set.
Falls back to Marketplace Insights (if ever granted), then an **active asks proxy**.

```bash
npx wrangler secret put SERPAPI_API_KEY
```

### Deploy

```bash
cd workers/snagly-api
npm install
npx wrangler login          # once, if needed
npx wrangler secret put EBAY_VERIFICATION_TOKEN
npx wrangler secret put EBAY_CLIENT_ID
npx wrangler secret put EBAY_CLIENT_SECRET
npm run deploy
```

### Local test (challenge)

```bash
# .dev.vars:
# EBAY_VERIFICATION_TOKEN=your-32-to-80-char-token

npm run dev
# Then GET http://127.0.0.1:8787/ebay/marketplace-account-deletion?challenge_code=test
```

Note: eBay will not accept localhost — only the live https URL on p2apps.com.
