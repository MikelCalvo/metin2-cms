# Player-facing refresh implementation plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Refresh the public-facing CMS so it feels like a premium Metin2 server portal: game-first home, customer-friendly downloads, and a cleaner getting-started flow inspired by active Metin2 server websites.

**Architecture:** Keep the existing Next.js App Router structure and premium dark design system, but shift the content model from "product/documentation" to "live server hub". Prioritize above-the-fold clarity, visible server-life signals, cleaner onboarding, and fewer dense blocks.

**Tech Stack:** Next.js App Router, TypeScript strict, React Server Components, Tailwind/shadcn UI, Vitest.

---

### Task 1: Inspect current player-facing pages and tests

**Objective:** Confirm the current implementation and identify the exact files to touch.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/downloads/page.tsx`
- Modify: `src/app/getting-started/page.tsx`
- Modify: `src/components/cms/site-header.tsx`
- Modify: `src/components/cms/site-footer.tsx`
- Test: `tests/unit/home/home-page.test.ts`
- Test: `tests/unit/downloads/downloads-page.test.ts`
- Create or modify: `tests/unit/getting-started/getting-started-page.test.ts`

**Verification:**
- Read the existing files.
- Confirm repo is clean before editing.

### Task 2: Reframe the home as a live Metin2 server hub

**Objective:** Make `/` feel like the real game home instead of a generic portal.

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/unit/home/home-page.test.ts`

**Implementation notes:**
- Keep the hero short and punchy.
- Bring server-life signals into the page (community, rankings, current activity, first steps).
- Reduce explanatory/product copy.
- Favor cards and sections that are quick to scan.

**Verification:**
- Home test asserts the new player-facing messaging and key links.

### Task 3: Make downloads feel like player onboarding, not a release page

**Objective:** Turn `/downloads` into a more natural extension of “start playing”.

**Files:**
- Modify: `src/app/downloads/page.tsx`
- Test: `tests/unit/downloads/downloads-page.test.ts`

**Implementation notes:**
- Keep one obvious primary download CTA.
- Keep checksum/resume info, but as trust/support details instead of the main tone.
- Reframe sections around first launch, installation confidence, and quick decisions.
- Avoid GitHub/release-panel language.

**Verification:**
- Downloads test asserts player-friendly copy, CTA visibility, and protected route usage.

### Task 4: Refresh getting-started to match the player-facing tone

**Objective:** Make `/getting-started` feel like a quick path to first login, not internal documentation.

**Files:**
- Modify: `src/app/getting-started/page.tsx`
- Create or modify: `tests/unit/getting-started/getting-started-page.test.ts`

**Implementation notes:**
- Keep the steps concise.
- Align with the updated home and downloads flow.
- Focus on “create account → download → patch → enter”.

**Verification:**
- New test covers the updated onboarding copy and links.

### Task 5: Tighten shared player-facing chrome

**Objective:** Make the header/footer feel more like a real server portal.

**Files:**
- Modify: `src/components/cms/site-header.tsx`
- Modify: `src/components/cms/site-footer.tsx`

**Implementation notes:**
- Strengthen game/community language.
- Keep navigation concise and action-oriented.
- Avoid sounding like a product site.

**Verification:**
- Relevant page tests should cover the shared chrome indirectly.

### Task 6: Validate, deploy, and verify runtime

**Objective:** Ensure the redesign passes targeted validation and remains deploy-safe.

**Files:**
- No source changes required unless validation reveals issues.

**Run:**
- `pnpm test tests/unit/home/home-page.test.ts tests/unit/downloads/downloads-page.test.ts tests/unit/downloads/download-client-route.test.ts tests/unit/getting-started/getting-started-page.test.ts`
- `pnpm typecheck`
- `pnpm exec eslint src/app/page.tsx src/app/downloads/page.tsx src/app/getting-started/page.tsx src/components/cms/site-header.tsx src/components/cms/site-footer.tsx tests/unit/home/home-page.test.ts tests/unit/downloads/downloads-page.test.ts tests/unit/getting-started/getting-started-page.test.ts`
- `pnpm build`
- `git push-deploy origin main`

**Runtime verification:**
- `/` returns `200` and contains the updated player-facing home content.
- `/downloads` returns `200` and keeps the primary download path.
- `/getting-started` returns `200` and shows the new onboarding copy.
- `/downloads/client` still supports ranged/resumable download behavior.
