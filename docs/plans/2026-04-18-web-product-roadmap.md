# Metin2 CMS Web Product Roadmap

> For Hermes: use this roadmap to decide the next implementation slice after the auth/account foundation. Ship in small vertical slices, keep the service-based deploy flow intact, and keep host-specific secrets/URLs out of the repository.

Goal: evolve the current Next.js CMS from an auth/account foundation into a complete modern private web platform for the Metin2 server, covering public product surfaces, rankings, item shop and operator tooling without breaking legacy database compatibility.

Architecture: keep the current boundary where `account.account` remains the live source of truth for identity and legacy balances, while all web-owned state continues to live in the CMS schema. Prefer read-only public/product slices first, then move into monetization and admin flows once the reusable public shell and data contracts are stable.

Tech stack: Next.js App Router, TypeScript strict mode, pnpm, Tailwind v4, shadcn/ui, Drizzle ORM, MariaDB (`account` + `metin2_cms`), FreeBSD rc.d service deploy on port `3000`.

---

## 1. Current baseline in the repo

Already implemented and verified:
- modern landing page shell
- login
- register
- password recovery
- reset password
- authenticated account area
- CMS-owned session handling
- auth audit logging
- rate limiting around auth/recovery flows
- password change + profile/email/delete-code updates from the account area
- reusable dark CMS/auth shells built on top of shadcn/ui
- service-backed production deploy flow with `metin2_cms`

What is still missing at product level:
- real public information architecture beyond the landing page
- download center / onboarding pages
- rankings / game-data read surfaces
- news or editorial publishing surfaces
- item shop domain model and UX
- operator/admin tooling

---

## 2. Product principles for the next phases

### 2.1 Build the web as four clear domains

1. Public product web
- landing
- game/about pages
- downloads
- onboarding/help
- later news/event pages

2. Account and trust layer
- login/register/recovery
- account center
- security/session management
- later verification and support surfaces

3. Game-data presentation
- rankings
- later character/guild pages
- later server status or operational widgets

4. Commerce and operations
- item shop
- catalog and offers
- purchase ledger and audit
- admin/editorial tooling

### 2.2 Keep the compatibility boundary strict

Keep using the live legacy schema for:
- login
- password hash
- email
- delete code
- cash/mileage display

Keep using CMS-owned tables for:
- sessions
- audit
- recovery
- future shop catalog, orders, balances ledger, admin logs and content metadata

### 2.3 Prefer low-risk read surfaces before purchase flows

Before writing monetization logic, lock in:
- public navigation
- reusable public layout components
- read-only data adapters for rankings
- the visual language of the site

This reduces rework before the item shop introduces stateful purchase flows and stricter auditing needs.

---

## 3. Strategic roadmap

## Phase 1 — Public web foundation

Outcome:
- the CMS stops feeling like only an auth portal
- visitors get a coherent private-site structure beyond `/`
- later rankings/item shop pages inherit the same layout and navigation

Target routes:
- `/`
- `/game` or `/about`
- `/downloads`
- `/getting-started`
- `/rankings` (initially placeholder or simple read-only shell if live data is not ready yet)

Scope:
- shared site navigation/header/footer
- richer public landing sections
- game overview page
- download center page with install/update guidance
- getting-started page for new players
- reusable CTA blocks and section shells

Why this phase first:
- fastest visible value
- mostly read-only
- low schema risk
- unlocks the design system for every later slice

Potential files:
- Create: `src/components/cms/site-header.tsx`
- Create: `src/components/cms/site-footer.tsx`
- Create: `src/components/cms/site-nav.tsx`
- Create: `src/components/cms/public-section.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/game/page.tsx`
- Create: `src/app/downloads/page.tsx`
- Create: `src/app/getting-started/page.tsx`
- Create: `src/app/rankings/page.tsx`
- Test: `tests/unit/ui/site-navigation.test.tsx`
- Test: `tests/unit/app/public-pages.test.tsx`

Verification:
- `pnpm test`
- `pnpm typecheck`
- focused `pnpm eslint` on touched files
- `pnpm build`
- local route checks on `/`, `/game`, `/downloads`, `/getting-started`, `/rankings`

---

## Phase 2 — Public content and live game-data surfaces

Outcome:
- the site gains real utility beyond authentication
- rankings become the first live read-only bridge between CMS and game data

Target features:
- top player rankings
- top guild rankings if the server schema allows it
- server- or empire-based filters if supported by live data
- empty/loading/error states that do not leak raw DB details
- optional homepage ranking preview widget

Technical direction:
- add read-only service/repository layer for ranking queries
- keep ranking queries isolated from auth/account logic
- consider caching or periodic snapshots once the raw queries are known

Potential files:
- Create: `src/server/rankings/rankings-repository.ts`
- Create: `src/server/rankings/rankings-service.ts`
- Create: `src/server/rankings/types.ts`
- Modify: `src/app/rankings/page.tsx`
- Create: `src/components/rankings/ranking-table.tsx`
- Create: `src/components/rankings/ranking-filter-bar.tsx`
- Test: `tests/unit/rankings/rankings-service.test.ts`

Open dependency:
- inspect the live player/guild schema before finalizing filters and ranking dimensions

---

## Phase 3 — Account center hardening and player convenience

Outcome:
- the authenticated area becomes genuinely useful day-to-day
- trust/security maturity improves before monetization arrives

Target features:
- clearer account summary modules for balances and protected actions
- account preference/history surfaces if needed
- better recovery/admin-contact hints
- optional email verification placeholder flow if the product needs it later
- clearer links from public pages into account actions

This phase is intentionally smaller because the current account foundation is already in good shape.

Potential files:
- Modify: `src/app/account/page.tsx`
- Modify: `src/components/account/*`
- Create: `src/components/account/account-balance-panel.tsx`
- Test: `tests/unit/account/*.test.ts`

---

## Phase 4 — Item shop foundation

Outcome:
- the project becomes a true CMS + item shop platform
- catalog and purchase state move into CMS-owned tables instead of ad hoc legacy assumptions

MVP capabilities:
- category-driven catalog
- product cards and product detail page
- balance summary for the authenticated account
- offer pricing using explicit currency naming (`cash`, `mileage`, voucher types if later needed)
- purchase intent + order audit trail
- manual-safe fulfillment model first, automation later

Recommended initial data model in `metin2_cms`:
- `shop_categories`
- `shop_products`
- `shop_product_prices`
- `shop_offers`
- `shop_order_intents`
- `shop_orders`
- `shop_order_lines`
- `shop_balance_ledger` or equivalent audit table

Important constraints:
- do not hardcode legacy PHP category names into the new domain model
- keep product taxonomy clean enough to support equipment, progression, cosmetics, vouchers and utility items
- treat voucher/currency products as first-class audited flows
- do not write any purchase side effects directly into legacy tables without an explicit adapter boundary and logging

Potential files:
- Create: `src/lib/db/schema/shop.ts`
- Create: `drizzle/0001_shop_foundation.sql`
- Create: `src/server/shop/catalog-service.ts`
- Create: `src/server/shop/order-service.ts`
- Create: `src/server/shop/types.ts`
- Create: `src/app/shop/page.tsx`
- Create: `src/app/shop/[slug]/page.tsx`
- Create: `src/components/shop/shop-shell.tsx`
- Create: `src/components/shop/product-card.tsx`
- Create: `src/components/shop/product-detail.tsx`
- Test: `tests/unit/shop/*.test.ts`
- Test: `tests/integration/shop/*.test.ts`

Open questions before implementation:
- exact purchase fulfillment path to the real game stack
- whether initial MVP spends `cash`, `mileage`, a separate CMS wallet, or only prepares audited order intents
- whether vouchers/gifts are in scope for v1 or later

---

## Phase 5 — Editorial and operator tooling

Outcome:
- the site becomes manageable without code changes for every content/catalog update
- operations gain auditability

Target features:
- admin authentication guardrail
- catalog CRUD
- homepage/public section editing
- ranking cache refresh or maintenance actions
- operational audit pages
- later support tooling

Potential files:
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/shop/page.tsx`
- Create: `src/app/admin/content/page.tsx`
- Create: `src/components/admin/*`
- Create: `src/server/admin/*`
- Test: `tests/unit/admin/*.test.ts`

---

## 4. Recommended next execution slice

Recommended next slice: Phase 1, public web foundation.

Reasoning:
- it gives the biggest visible jump after auth/account
- it is mostly read-only and therefore safe
- it establishes the reusable public information architecture needed by rankings and shop
- it gives us a cleaner place to link downloads, onboarding and later ranking/shop entry points

Concrete order for the next implementation pass:

1. Introduce shared public navigation components.
2. Refactor the landing page to use those shared public components.
3. Add `/game` with the game overview and server value proposition.
4. Add `/downloads` with launcher/client install guidance.
5. Add `/getting-started` with onboarding steps.
6. Add `/rankings` as a designed shell even if live data lands in the following pass.
7. Add focused tests for public routes and navigation.
8. Update `README.md` status/roadmap pointers after the slice is in place.

---

## 5. Suggested validation discipline for every new slice

For each phase, keep the same verification baseline unless the user asks otherwise:
- focused unit tests for touched domains
- `pnpm typecheck`
- focused `pnpm eslint` on changed files
- `pnpm build`
- local HTTP checks against the service runtime when the slice changes public routes

Do not add host-specific URLs, reverse-proxy details, remotes or secrets to the repo.

---

## 6. Open product questions to resolve later

- Which live DB tables should feed rankings, and which ranking dimensions actually matter first?
- Should downloads be simple static links/guides first, or should we model client versions and release notes immediately?
- What is the first real item shop currency contract for MVP: legacy `cash`, legacy `mileage`, separate CMS wallet, or an audited hybrid?
- Does the private site need news/event publishing before the shop, or can that wait until admin/editorial tooling exists?
- Do we want character/guild public profile pages in the rankings phase or only tabular ladders first?

---

## 7. Short version

Current foundation is strong enough. The next sensible move is:
- public web foundation
- then rankings/live read surfaces
- then item shop foundation
- then admin/editorial tooling

That order gives the project a coherent product shell before we introduce the higher-risk commerce workflows.
