# Snagly — agent handoff

Read this first in a new chat. Keep it updated when phase progress changes.

## What Snagly is

AI resale assistant: user types an item/model they want to hunt → Snagly watches eBay UK → shows only strong opportunities with **honest net profit** after fees/shipping, confidence, and plain-English “why.”

**Fewer, better alerts.** Silence beats a bad bargain.

## Product decisions (locked)

| Decision | Choice |
| --- | --- |
| Stack | **React Native / Expo** (iPhone first, Android later if it takes off) |
| Marketplace | **eBay UK only** for MVP |
| Niche | **Telescopes** (not mounts/cameras yet) |
| Core UX | Type item / model → watchlist (category browse is later) |
| Design | Dark navy, purple→pink→orange gradient, DM Sans — see `DESIGN.md` |

## Where we are (as of 2026-07-20)

**Phase 1 started** — live eBay UK telescope comps + deal scoring in the app.

Done:

- Expo app in `mobile/` with tabs: Home · Deals · Watchlist · Settings
- Watch create / edit / delete / pause
- Fee + alert-gate settings
- Sample telescope watches (deals come from live eBay checks)
- Live eBay UK search + SerpApi sold comps + deal scoring via snagly-api
- Deals / Home pull-to-refresh against active watches
- Brand app icon in assets + iOS AppIcon
- Native iOS project kept in repo (`mobile/ios/`) for Xcode

Not done yet:

- Background watch polling + push alerts
- Auth / accounts
- Condition matching beyond basic junk filters

**Infra:** `snagly-api.p2apps.com` — deletion notifications, live search, SerpApi sold comps, `/v1/ebay/deals` scoring.

**Next:** Background polling + push when a watch clears the profit bar.

See `ROADMAP.md` for full phase list.

## How to run

```bash
cd mobile
npm install
npm run ios          # preferred if Xcode + CocoaPods set up
# or: npm start / npm run web
```

**Xcode:** always open `mobile/ios/Snagly.xcworkspace` (or double-click `Open Snagly in Xcode.command`). Do **not** open the `.xcodeproj` alone.

Signing team id is set (`appleTeamId` in `app.json` / `DEVELOPMENT_TEAM` in project). Owner Apple ID: Martin Wilcox.

## Key docs

| File | Purpose |
| --- | --- |
| `CONCEPT.md` | Vision & user journey |
| `DESIGN.md` | Brand / UI tokens |
| `ROADMAP.md` | Features + build phases |
| `docs/snagly-brand-ui-sheet.png` | Brand sheet |
| `docs/Snagly_App_Concept_Notes.pdf` | Original concept PDF |

## Repo

https://github.com/inspiral69/snagly — default branch `main`.

## Agent habits

- Prefer **plain English** with the user; avoid dumping paths unless they ask.
- Do **not** commit/push unless asked.
- After meaningful progress, **update this file** (status + “next”) and the Phase checkboxes in `ROADMAP.md`.
- Protect alert quality: don’t ship noisy low-confidence “deals.”
