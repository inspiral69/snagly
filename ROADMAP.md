# Snagly — Feature list & build roadmap

Strategy: **one marketplace, one niche, fewer-but-better alerts.**

North star: AI watches the market for you, shows only high-quality opportunities with honest net profit, explains why in plain English, and notifies you fast enough to act.

## Feature list by priority

| Priority | Feature | Why it matters |
| --- | --- | --- |
| **P0** | Account + create watches | Core loop starts with “what I care about” |
| **P0** | Sold comps + fair value estimate | Without good comps, every alert is guesswork |
| **P0** | Net profit (fees + shipping) | Gross “cheap” lists lie; net profit builds trust |
| **P0** | Deal card: profit, ROI, % below market | Decision at a glance |
| **P0** | Confidence + “why it’s a good deal” | Explanation is the AI differentiator |
| **P0** | Live check + push notification | Speed is the product for snipers |
| **P0** | Open listing in one tap | Close the path from alert → buy |
| **P1** | Alert sensitivity (min £ / ROI / confidence) | Stops notification fatigue |
| **P1** | Condition & accessory matching | Biggest source of false bargains |
| **P1** | Seller risk signals | Protects users from bad sellers |
| **P1** | Portfolio: buy → sell → real profit | Proof Snagly was right (or not) |
| **P1** | Estimate vs reality feedback | Improves scoring and credibility |
| **P2** | Daily digest mode | For non-power users |
| **P2** | Paste a link → “Should I snag?” | Instant verdict without a watch |
| **P2** | More categories (same marketplace) | Expand only after niche quality is solid |
| **Later** | Vinted, FB, Gumtree, CEX, etc. | Universal opportunity finder |
| **Later** | Cross-marketplace arbitrage | Buy cheap here, sell there |
| **Later** | Tax / P&L export | Serious flipper retention |

## Build roadmap

Rough durations assume a small team / solo + AI. **Quality of alerts beats calendar speed.**

### Phase 0 — Foundation (~1–2 weeks) ✅ scaffolding started

Project scaffolding, local data model, design tokens from `DESIGN.md`.

- [x] Expo app (`mobile/`) with dark theme + DM Sans
- [x] Watches create / edit / delete
- [x] User settings (default fees + alert gates)
- [x] eBay listing ingest plumbing (stub)
- [x] Home / Deals / Watchlist / Settings shells + deal detail
- [ ] Account / auth (deferred — local-first for now)

Launch niche locked for MVP: **telescopes** · **eBay UK**.

### Phase 1 — Core deal engine (MVP, ~3–5 weeks)

First product people can trust enough to try.

- Sold comps + fair value
- Fee / shipping math → net profit + ROI
- Scoring + confidence + short explanation
- Deal detail UI
- Watch polling + push alerts
- Open on eBay

**MVP constraints:** eBay UK only · **one niche** (telescopes only for MVP; mounts / astro cameras later)

### Phase 2 — Trust & filters (~2–3 weeks)

Make alerts rarer and more accurate.

- Min profit / ROI / confidence gates
- Condition & accessory matching
- Seller risk signals
- Suppress duplicates
- Low confidence never looks like a slam dunk

### Phase 3 — Portfolio loop (~2–3 weeks)

Close the loop: estimate → purchase → sell → learn.

- Mark as bought
- Track fees & resale
- Monthly profit / ROI / hold time
- Compare AI estimate vs actual
- Improve scoring from misses

### Phase 4 — Convenience (growth, ~2–4 weeks)

After P1–P3 feel solid.

- Daily digest
- Paste-link “Should I snag?”
- Smarter watch templates
- More categories on the same marketplace

### Phase 5 — Marketplaces & depth (expand)

Only after eBay niche quality is clearly good.

- Vinted / Facebook Marketplace / Gumtree / CEX
- Cross-site arbitrage hints
- Tax export
- Bundles

## Success checks before leaving Phase 1

| Check | Target |
| --- | --- |
| Users agree alerts are “mostly worth opening” | Fewer than ~1 in 5 feel like duds |
| Net profit estimate feels honest | Fees + shipping clearly shown |
| Time from listing live → notification | Minutes, not hours (niche-dependent) |
| Explanation readable by a non-expert | Short “why” + checklist |

## Biggest risk

Bad alerts destroy trust faster than missing a deal. Prefer silence over a low-confidence “bargain.”
