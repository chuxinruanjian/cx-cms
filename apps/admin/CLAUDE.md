# CLAUDE.md

## Project

Ant Design Pro — React enterprise boilerplate on Umi Max v4, antd v6, ProComponents v3.

## Commands

`npm start` (dev+mock), `npm run dev` (no mock), `npm run build` (utoopack), `npm run lint` (Biome+tsc), `npm run test` (Vitest), `npx antd lint ./src` (antd-specific checks).

Other: `npm run openapi` (regenerate `src/services/`), `npm run simple` (**irreversible** — commit first), `npm run biome` (auto-fix), `npm run tsc` (type-check only).

## Critical Rules

- **Never edit `src/services/ant-design-pro/`** — auto-generated, regenerate with `npm run openapi`
- **Biome only** — no ESLint, no Prettier. Both `npm run lint` and `npx antd lint ./src` must pass before commit
- **Always `npx antd info <Component>` before writing antd code** — don't guess APIs from memory
- **`npm run simple` is irreversible** — always commit/branch first
- **Conventional commits** required (commitlint enforced)
- **TypeScript strict** · **Node ≥ 24** · **`package-lock.json`** (not yarn/pnpm)
- **`.umi` dir is auto-generated** — delete `src/.umi` and restart if dev server acts up

## Architecture Essentials

**Config**: `config/config.ts` (defineConfig), `config/routes.ts` (declarative routes). Route `name` → `menu.xxx` i18n key; `access` field gates visibility.

**Convention files** (`src/`): `app.tsx` (runtime config + `getInitialState`), `access.ts` (permissions), `global.tsx` (side effects), `loading.tsx`, `typings.d.ts`.

**Auth**: `getInitialState()` → `GET /api/currentUser`; 401 → redirect login. `access.ts`: `canAdmin = currentUser.access === 'admin'`. Mock creds: `admin`/`ant.design` or `user`/`ant.design`.

**State**: `useModel('filename')` for global hooks (`src/models/`). `useModel('@@initialState')` for currentUser/settings. ProTable `request` prop for most data loading. `@tanstack/react-query` for complex server state.

**Styling priority**: Tailwind CSS v4 (layout) → antd-style v4 / `createStyles` (theme tokens) → CSS Modules → Less (legacy only).

**Request**: built-in `request` from `@umijs/max`, configured in `src/requestErrorConfig.ts`. Per-page `service.ts` for non-generated APIs.

**i18n**: only `zh-CN` and `en-US` in `src/locales/`.
`useIntl().formatMessage({ id, defaultMessage })`.

**Branding**: title, bilingual slogan, footer copyright, and timezone come from
`.env`; keep `.env.example` current. API requests always use the current origin;
the development proxy reads the API port from `apps/api/.env`. The logo is fixed
at `public/logo.png`, and the application is always hosted at `/admin/`.

**Time**: import the configured wrapper from `@/utils/dayjs`, never import Day.js
directly in application code. `APP_TIMEZONE` is the display/calculation timezone.

**Mock**: `mock/` (global) + `src/pages/**/_mock.ts` (co-located). Express-style handlers.


## AI Skills

This project ships with two built-in Claude Code Skills (`.claude/skills/`). If you already have these skills in your project, no installation is needed — just run them directly. To update to the latest skill definitions, run `npx skills add ant-design/ant-design-pro`.

### `/pro-upgrade` — Project Upgrade

Run `/pro-upgrade` in Claude Code to auto-upgrade the project to the latest Ant Design Pro version. It diffs the latest template against this project and merges framework changes while preserving business code. Works for any version gap (v5→v6, v6.x→latest, etc.).

### `/antd` — Ant Design CLI

Run `/antd` in Claude Code for any antd-related work. It provides access to `@ant-design/cli` with offline metadata for antd v3/v4/v5/v6. Key commands:

- `npx antd info <Component>` — look up props/API before writing code (mandatory)
- `npx antd lint ./src` — check for deprecated or problematic usage (must pass before commit)
- `npx antd demo <Component> <demo>` — get working code examples
- `npx antd migrate <from> <to>` — migration checklist between major versions

## Page Co-location

Each page dir: `index.tsx`, optional `service.ts`, `_mock.ts`, `data.d.ts`, style files. Keep page-specific code with the page.

## Admin UI Standard

Use `src/pages/ui-standard` and `../../docs/admin-ui-standards.md` as the required
blueprint for new business pages:

- Wrap business pages with `@/components/AdminPage` so their outer boundary
  matches the `GridContent` used by `dashboard/analysis`. Keep compact titles
  and breadcrumbs; do not add `PageContainer` padding or page descriptions.
- List row actions use one bordered `MoreOutlined` dropdown button. Every menu
  item needs a semantic icon and concise text such as "详情".
- Filters are always visible, use `Form layout="vertical"`, and put labels above
  controls. Do not add a filter-card title; place the reset/search row below the
  fields and align it right.
- Create/import actions are on the left of the list toolbar; view controls are
  the native `ProTable` refresh, density, and column-setting icons on the right.
- More than six visible create/edit fields require a dedicated page. Six or
  fewer normally use a modal.
- Dedicated form page actions such as back and save belong in the top-right
  page header.
- Detail pages are wide-screen-first and responsive.
- Every new label, action, status, validation hint, and message needs both
  `zh-CN` and `en-US` locale entries.
- Keep the global header limited to language switching and the user dropdown.
  Do not add documentation/version actions or a floating SettingDrawer. User
  avatars must fall back to text initials when no image is available.
- Business forms import upload controls from `src/components/Uploader`. Use
  `MultiImageUploader` for a sortable picture-card photo wall and
  `AvatarUploader` for mandatory 1:1 avatar cropping; do not rebuild these flows
  with page-local `Upload` code.
- Rich-text fields import `TiptapEditor` from `src/components`. The
  `demoImageUpload` helper is restricted to the static UI-standard blueprint.
  A business image adapter must use the shared upload architecture and return a
  durable URL that an HTML `<img>` can render without a bearer header; never
  save data URLs, blob URLs, or protected admin attachment URLs as business HTML.
  HTML sanitizers and renderers must preserve Tiptap `span` color/font-size
  styles plus image `width`/`height` attributes so text styling and resized
  images survive a save/load round trip.

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---
