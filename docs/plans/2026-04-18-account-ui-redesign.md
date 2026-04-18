# Account UI Redesign Implementation Plan

> For Hermes: use this plan as the design brief before touching `/account` and the authenticated surfaces.

Goal: reorganize the authenticated account area into a clearer, prettier and more modern dashboard with stronger visual hierarchy, explicit categories and less repeated card noise.

Architecture: keep the current Next.js App Router structure and legacy-compatible data model, but stop treating `/account` as a flat list of white cards. Introduce a small shared dashboard UI layer for authenticated screens: section shells, summary cards, settings panels and compact activity rows. The redesign should prioritize information architecture first, then polish, then consistency across `/login`, `/register`, `/recover` and `/account`.

Tech stack: Next.js App Router, React server + client components, Tailwind utility classes, existing server actions, existing audit/session/profile services.

---

## 1. Why redesign now

Current `/account` is already functional, but visually it still feels like an internal milestone page instead of a product surface.

Main UX/UI problems observed:
- too many cards with the same visual weight
- weak hierarchy: everything looks equally important
- security information is split across multiple blocks but not presented as one coherent `Security Center`
- recent auth activity is verbose and repetitive
- sessions and activity expose too much raw technical detail by default
- forms for `Change password` and `Profile settings` are correct, but visually detached from a larger page structure
- authenticated surfaces and auth entry pages do not yet share a recognizable CMS design language

---

## 2. Chosen visual direction

Use a calm modern product-dashboard direction closer to Linear/Vercel than to a flashy game panel.

Rationale:
- `/account` is primarily a trust/security/settings surface, not marketing
- dark-first, low-noise product UI works better for sessions, audit logs and forms
- strong section hierarchy and restrained accent colors will make the CMS feel more premium without overdesigning it

Design cues to borrow:
- from Linear:
  - dark background shell
  - stronger surface hierarchy
  - compact metric cards
  - cleaner status chips
  - less visible borders, more surface depth
- from Notion:
  - simpler copy
  - cleaner grouping of related information
  - lower perceived complexity in settings panels

Important constraint:
- do NOT make it “gamey” yet
- the authenticated CMS should look like a modern SaaS/admin product first
- branding/theme specific to the public site and future itemshop can come later

---

## 3. New information architecture for `/account`

### Top-level structure

1. Page header
2. Account overview
3. Profile & game data
4. Security center
5. Recent activity
6. Session/actions footer area

### 3.1 Page header

Replace the current technical intro with a real page header:
- eyebrow: `Account`
- title: `admin` or `Your account`
- short subtitle focused on what the page does for the user
- right-aligned quick actions later if needed (`Sign out`, maybe `Close other sessions` when applicable)

Copy target:
- user-oriented
- less architecture wording (`CMS-owned session store`, `legacy record`) on the main screen

### 3.2 Account overview

Keep this as the first focal area.

Content:
- active sessions count
- last successful sign-in
- latest sign-in issue
- latest recovery/settings event

Format:
- 4 compact summary cards in one row/grid
- clearly stronger hierarchy than the rest of the page
- this becomes the landing zone of the account dashboard

### 3.3 Profile & game data

Split the current identity/balances logic into two grouped categories under one section row:

A) Profile
- login
- email
- delete code / social id
- account status

B) Game account
- cash
- mileage
- last play

Reason:
- `Last play` belongs more to game/account state than to monetary balances alone
- `Profile` should feel like editable identity data
- `Game account` should feel read-only and legacy-derived

### 3.4 Security center

This should become the strongest secondary section after overview.

Sub-blocks:
- `Password & recovery`
  - change password form
  - later: recovery/contact hints, 2FA placeholder
- `Signed-in sessions`
  - current device highlighted
  - other sessions below in lighter rows
  - `Close other sessions` action at section level

Reason:
- today these pieces exist but feel disconnected
- grouping them under one explicit security section improves comprehension immediately

### 3.5 Recent activity

Convert the current repeated full cards into a compact activity feed.

Each row should show by default:
- event label
- status chip
- relative/short timestamp
- condensed device label
- IP
- optional expand/collapse for full raw details

Do not show the full raw user-agent string at full prominence by default.

Preferred default representation:
- `Opera on macOS`
- `Chrome on Windows`
- fallback to raw string only if parsing is not available yet

### 3.6 Session details

For the sessions area:
- current session gets featured styling
- other sessions should be visually smaller than the current one
- session UUID should be de-emphasized, not headline-level information
- primary visible info:
  - current/other status
  - last seen
  - created
  - IP
  - browser/device summary
- raw agent / full id can remain secondary text

---

## 4. Visual system changes to introduce

### 4.1 Global page shell

Target feel:
- dark root background
- centered max width container
- sections separated by larger vertical rhythm
- surfaces layered with 2–3 depth levels, not all identical

Introduce design tokens in `src/app/globals.css` via CSS custom properties or a simple utility layer for:
- page background
- panel background
- elevated panel background
- soft border
- primary text
- secondary text
- accent
- success
- warning

### 4.2 Shared dashboard primitives

Create a small reusable component layer under `src/components/account/` or `src/components/ui/`.

Proposed primitives:
- `DashboardSection`
  - title
  - description
  - optional actions slot
- `SummaryCard`
  - eyebrow/label
  - primary value
  - helper text
  - tone
- `SettingsPanel`
  - reusable shell for forms like password/profile settings
- `ActivityRow`
  - compact recent event row
- `SessionCard`
  - current session / other session variants
- `StatusChip`
  - success / attention / neutral / current

Goal:
- stop repeating the same hand-written panel shell styles in every form/card
- make future `/admin`, rankings and itemshop screens benefit from the same design language

### 4.3 Copy cleanup

Adjust titles/subtitles so sections read like a product, not a dev note.

Examples:
- `Authenticated account` -> `Account`
- `Legacy balances` -> `Game account`
- `Web sessions` -> `Signed-in sessions`
- `Recent auth activity` -> `Recent account activity`

### 4.4 Density reduction

Reduce default cognitive load by:
- moving raw details to secondary text
- shortening repetitive descriptions
- using chips and compact metadata rows
- reducing repeated explanatory paragraphs once the UI itself becomes clearer

---

## 5. Exact files likely involved

### Core page files
- Modify: `src/app/account/page.tsx`
- Modify: `src/app/globals.css`

### Existing account components to refactor into a common visual system
- Modify: `src/components/account/change-password-form.tsx`
- Modify: `src/components/account/profile-settings-form.tsx`

### New reusable UI components
- Create: `src/components/account/dashboard-section.tsx`
- Create: `src/components/account/summary-card.tsx`
- Create: `src/components/account/status-chip.tsx`
- Create: `src/components/account/session-card.tsx`
- Create: `src/components/account/activity-row.tsx`
- Optional later: `src/components/account/page-header.tsx`

### Data shaping helpers
- Modify: `src/server/account/account-security-summary.ts`
- Optional create: `src/server/account/account-ui-formatters.ts`
  - device label formatting
  - timestamp display formatting

### Tests to touch
- Create/Modify: `tests/unit/account/account-security-summary.test.ts`
- Create: `tests/unit/account/account-ui-formatters.test.ts`
- Optional page/component tests later if component coverage grows

### Documentation
- Modify: `README.md`
- Write note: `/opt/metin2/notes/metin2-cms-account-ui-redesign-plan.md`

---

## 6. Proposed execution order

### Phase 1 — foundation / visual primitives
Objective: stop styling each card/form ad hoc.

Tasks:
1. Add page/surface/text/accent tokens in `src/app/globals.css`
2. Create `StatusChip`
3. Create `DashboardSection`
4. Create `SummaryCard`
5. Refactor `ChangePasswordForm` and `ProfileSettingsForm` to use shared shells

Expected result:
- visual consistency improves immediately without touching business logic

### Phase 2 — `/account` layout rewrite
Objective: reorganize the page by category and hierarchy.

Tasks:
1. Replace current intro with a real page header
2. Keep overview as first section
3. Split `Identity` and `Legacy balances` into `Profile` + `Game account`
4. Group password/profile editing into a `Settings` or `Profile & security` row
5. Group sessions inside `Security center`

Expected result:
- the page reads top-down in a much more obvious way

### Phase 3 — compact activity and sessions
Objective: reduce repetition and technical noise.

Tasks:
1. Create `SessionCard` with current vs other variants
2. Create `ActivityRow`
3. Reduce repeated descriptions in activity items
4. Show condensed device labels by default
5. De-emphasize raw UUID/user-agent strings

Expected result:
- activity becomes scannable instead of log-like

### Phase 4 — auth page consistency
Objective: align `/login`, `/register`, `/recover`, `/reset-password` with the same design language.

Tasks:
1. Refactor auth forms to use the same surface system
2. Reuse section/title/alert/button styles
3. Keep SSR/auth logic unchanged

Expected result:
- the product finally feels like one CMS instead of separate milestone screens

---

## 7. Guardrails while redesigning

- do not touch account/recovery/session business logic unless the UI requires a tiny formatter/helper
- do not introduce a large UI framework just for cosmetics
- do not over-animate
- do not add gaming visual tropes yet
- keep the page accessible and readable first
- prefer shared components over one-off class strings
- if there is any ambiguity, prioritize:
  1. hierarchy
  2. category separation
  3. scanability
  4. polish

---

## 8. Acceptance criteria for the redesign

The redesign is good enough when:
- a user can understand the page structure in 5 seconds
- overview, profile/game data, security and activity are visibly distinct categories
- the current session stands out immediately
- recent activity can be scanned without reading every card in full
- forms feel like part of the same design system
- `/login` and `/account` look like the same product family

---

## 9. Recommended next implementation slice

Start with `/account` only.

First concrete delivery should be:
- new page shell
- shared section/card primitives
- reorganized categories
- more compact sessions/activity

That gives the biggest visual win before expanding the redesign to auth routes.
