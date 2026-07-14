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
| Niche | **Cameras & lenses** (not sneakers yet) |
| Core UX | Type item / model → watchlist (category browse is later) |
| Design | Dark navy, purple→pink→orange gradient, DM Sans — see `DESIGN.md` |

## Where we are (as of 2026-07-14)

**Phase 0 — Foundation: mostly done** (local-first UI scaffold).

Done:

- Expo app in `mobile/` with tabs: Home · Deals · Watchlist · Settings
- Watch create / edit / delete / pause
- Fee + alert-gate settings
- Sample camera deals + deal detail (“why”, profit breakdown, open eBay)
- Stub eBay module (`mobile/lib/ebay.ts`) — no live API yet
- Brand app icon in assets + iOS AppIcon
- Native iOS project kept in repo (`mobile/ios/`) for Xcode

Not done yet:

- Real eBay sold comps / live listings
- Scoring engine beyond seed data
- Push notifications
- Auth / accounts

**Next:** Phase 1 — core deal engine (comps, net profit math on live data, confidence, watch polling, push).

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
