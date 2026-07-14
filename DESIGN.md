# Snagly – Brand & UI Design Notes

Source: brand / UI design sheet (`docs/snagly-brand-ui-sheet.png`).

## Brand Identity

**Logo:** Stylised capital “S” with a purple → pink → orange gradient and a small four-point star accent.

**Wordmark:** `snagly` in lowercase, clean sans-serif.

**Tagline:** AI finds the deals. *You snag them.*

**App icon variants:** Deep navy (primary), white, purple gradient, black, orange gradient — always with the gradient “S”.

## Brand Personality

Smart · Friendly · Trustworthy · Modern · Energetic

## Value Props (product messaging)

| Theme | Line |
| --- | --- |
| AI Deal Finder | Scans thousands of listings 24/7 |
| Undervalued Opportunities | Find the deals others miss |
| Act Fast | Get notified the moment it’s live |
| Flip Smarter | More profit. Less guesswork |

## Colour Palette

| Name | Hex | Role |
| --- | --- | --- |
| Primary Purple | `#6366F1` | Primary actions, key accents |
| Vibrant Pink | `#EC4899` | Gradient mid / emphasis |
| Bright Orange | `#F97316` | Gradient end / energy accents |
| Deep Navy | `#0F172A` | Main dark background |
| Slate Grey | `#334155` | Secondary surfaces, borders |
| Off-White | `#F8FAFC` | Light text / light surfaces |

**Brand gradient:** purple → pink → orange (`#6366F1` → `#EC4899` → `#F97316`).

## Typography

**Font:** DM Sans — clean, modern, friendly; built for clarity and trust.

**Weights to use:** Bold, Semibold, Medium, Regular.

## Iconography

Minimalist thin-line icons with rounded corners. Keep icons simple and consistent across home, deals, watchlist, and settings.

## UI Direction (from mockups)

Dark-mode first interface on deep navy. Feels premium and finance-adjacent, with clear emphasis on:

- Estimated profit
- ROI
- “% below market” badges
- Short “why it’s a good deal” explanations

### Home / Dashboard

- Header: snagly logo + notification bell (unread indicator)
- Hero card: purple/orange gradient summary (e.g. “6 new opportunities…”) with **View Deals** CTA
- Opportunity cards: product name, price, “% below market” badge, **Est. Profit**, **ROI**
- Bottom nav: Home · Deals · Watchlist · Settings

### Deal / Product Detail

- Product price + “% below market” badge
- Est. Profit range + ROI
- **Why it’s a good deal** checklist (e.g. below average sold price, high demand, fast selling, trusted seller)
- Primary CTA: **Add to Watchlist**
- Secondary CTA: **View on eBay** (opens listing externally)

## Design Tokens (starter)

```css
:root {
  --color-purple: #6366f1;
  --color-pink: #ec4899;
  --color-orange: #f97316;
  --color-navy: #0f172a;
  --color-slate: #334155;
  --color-off-white: #f8fafc;
  --font-sans: "DM Sans", system-ui, sans-serif;
  --gradient-brand: linear-gradient(135deg, #6366f1, #ec4899, #f97316);
}
```
