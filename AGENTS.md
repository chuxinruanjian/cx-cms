# CX CMS AI Development Guide

## Project goal

This repository is the reusable foundation for AI-assisted business development.
Keep the architecture predictable, make the smallest complete change, and update
this file whenever a top-level directory or cross-application convention changes.

## Directory contract

```text
cx-cms/
├── apps/
│   ├── api/                 # AdonisJS API and all server-side business logic
│   │   └── public/          # Public static files and generated frontend builds
│   ├── admin/               # Ant Design Pro management web application
│   └── h5/                  # Reserved mobile-web application directory
├── storage/
│   ├── database/            # Local SQLite files; runtime-only
│   ├── logs/                # API logs; runtime-only
│   ├── uploads/
│   │   ├── images/          # Uploaded images; runtime-only
│   │   ├── videos/          # Uploaded videos; runtime-only
│   │   └── files/           # Other uploads; runtime-only
│   └── certificates/payment/# Payment certificates/keys; secret, runtime-only
├── docs/                     # Cross-application architecture and integration guides
├── package.json             # npm workspace commands
└── AGENTS.md                # Repository-wide instructions (this file)
```

Do not confuse these areas:

- Server controllers, models, validators, jobs, and integrations belong in
  `apps/api`.
- Desktop management UI pages and components belong in `apps/admin`.
- Mobile browser UI belongs in `apps/h5`, never in the admin app.
- Domain-verification and other intentionally public static files belong in
  `apps/api/public`. Runtime uploads and secrets belong in `storage`, never in
  `public`.

The more specific `apps/admin/AGENTS.md` also applies to admin changes.

## Commands

Run commands from the repository root unless noted otherwise.

- `npm install`: install every workspace from the single root lockfile.
- `npm run dev`: start API and admin development servers together.
- `npm run dev:api`: start only AdonisJS on port 3333.
- `npm run dev:admin`: start only Ant Design Pro on port 8000.
- `npm run build`: build admin first, then copy it into the API production build.
- `npm run build:admin`: build admin into `apps/api/public/admin`.
- `npm run build:api`: build AdonisJS and copy `public/**` into `build/public`.
- `npm run lint`: lint all implemented applications.
- `npm run typecheck`: type-check API and admin.
- `npm test`: run all workspace tests.
- `npm run db:migrate`: apply Lucid migrations.
- `npm run db:rollback`: roll back the latest Lucid migration batch.
- `npm run db:seed`: initialize RBAC permissions and the first super administrator.
- `npm run uploads:cleanup`: delete expired multipart sessions and unbound temporary files.

Before finishing a change, run the smallest relevant checks. For cross-cutting
changes, run typecheck, tests, and builds for every affected workspace.

## API and database rules

- Use Lucid models, migrations, and query builder for SQL access. Do not introduce
  a second ORM or write database-specific business logic without a documented need.
- `DB_CONNECTION=sqlite` is the local/small-project default.
- Switch to MySQL with `DB_CONNECTION=mysql` and the `DB_*` variables. Both
  `better-sqlite3` and `mysql2` are project dependencies.
- All schema changes require a migration in `apps/api/database/migrations`.
- Migrations must work on both SQLite and MySQL unless a requirement explicitly
  limits support. Avoid database-specific column types, raw SQL, and functions.
- Never commit a SQLite database, dump, real credential, `.env`, upload, log, or
  payment certificate.
- API routes use the `/api/v1` prefix. Keep transport concerns in controllers,
  validation in validators, and reusable business logic in services.
- Every management-only table uses the `admin_` prefix. Shared infrastructure
  tables such as attachments are explicitly exempt. The RBAC schema consists of
  `admin_users`, `admin_access_tokens`, `admin_roles`, `admin_permissions`,
  `admin_user_roles`, and `admin_role_permissions`.
- Management authentication routes use `/api/v1/admin/auth/*`. There is no public
  administrator signup route; create the first account with `npm run db:seed`.
- Administrator SMS login uses the shared `sms_codes` table and the services under
  `app/services/sms`. Keep codes hashed, short-lived, rate-limited, single-use,
  and out of application logs. Provider credentials, sign names, and template
  codes come from environment variables; controllers must not call an SMS SDK
  directly.
- An access token proves identity only. Roles and permissions must be resolved
  from the database at request time through `AdminRbacService`, so revocation is
  effective immediately. `is_super_admin` is the explicit authorization bypass.
- Permission codes use dot-separated lowercase names such as
  `admin.roles.update`. Protect management routes with the named `adminRbac`
  middleware instead of duplicating role checks in controllers.
- File tables use `attachments`, `attachment_relations`, `upload_sessions`, and
  `upload_chunks`. They are shared infrastructure tables and therefore do not
  use the management-only `admin_` prefix. Business tables store
  attachment IDs or bind through `AttachmentService`; they never store local
  storage paths as their only file reference.
- All upload scenarios use the services under `app/services/upload`. Business
  code must use `StorageManager`, never a concrete OSS/S3 SDK directly.
- Frontend upload scenarios use `apps/admin/src/components/Uploader` and its
  shared task manager. Do not implement page-specific upload requests, retry, or
  deletion state. Multi-image fields use the shared `picture-card` photo wall;
  avatar fields use `AvatarUploader` and keep its mandatory 1:1 crop flow.
- Rich-text HTML sanitizers and renderers must preserve Tiptap `span`
  `color`/`font-size` styles and image `width`/`height` attributes. Removing
  them breaks font formatting and resized-image persistence.
- Rich-text fields use `apps/admin/src/components/TiptapEditor`. The
  `demoImageUpload` data-URL adapter is only for the static `/ui-standard/create`
  blueprint. Business rich-text images must integrate through the shared upload
  architecture and persist a durable browser-renderable URL plus attachment
  identity; never persist demo data URLs, blob URLs, or the bearer-protected
  admin attachment content route inside business HTML.
- Uploaded files start as `temporary` and become `active` only after a successful
  business bind. Schedule `npm run uploads:cleanup` to remove expired temporary
  files and multipart sessions.
- `POST /attachments/bind` synchronizes the complete attachment set for one
  business type, ID, and field. Send an empty list to clear the field; never
  mutate `attachment_relations` directly from a controller.

## Frontend rules

- Admin API requests use relative `/api/v1/...` URLs. Development proxying is
  configured in `apps/admin/config/proxy.ts`; production routing is infrastructure.
- Admin supports only `zh-CN` and `en-US`. Do not add another locale unless the
  product requirement explicitly changes.
- Login title, slogans, and footer copyright come from `apps/admin/.env`; use
  `apps/admin/.env.example` as the documented contract and never store them in the
  database. The logo is fixed at `apps/admin/public/logo.png`.
- Parse, calculate, and display frontend business time through
  `apps/admin/src/utils/dayjs.ts`. Do not import Day.js directly in application
  code. Keep `APP_TIMEZONE` aligned with the API `TZ` setting.
- Do not duplicate backend validation rules as the only source of truth.
- Keep page-specific files co-located in the page directory.
- Read and follow `apps/admin/AGENTS.md` before editing the admin application,
  especially its generated-service and Ant Design API rules.
- `apps/h5` currently has no selected framework. Do not initialize one unless the
  task explicitly chooses the H5 stack; when initialized, add it to root workspaces,
  use `/h5/` as its base path, and build it into `apps/api/public/h5` before the API
  build runs.
- Admin is always hosted at `/admin/` and builds into `apps/api/public/admin`.
  Do not make either path environment-configurable.
- New admin list, form, and detail pages follow `docs/admin-ui-standards.md`
  and the live blueprint under `apps/admin/src/pages/ui-standard`.
- List row actions use one bordered `MoreOutlined` dropdown button; every menu
  item has an icon and concise copy such as "详情". Filters stay expanded with
  vertical labels and no filter-card title. Reset/search actions sit below the
  fields and align right.
- List tables use the native `ProTable` refresh, density, and column-setting
  controls. Create/import actions belong on the left side of the toolbar.
- Create/edit forms with more than six visible fields use a dedicated page.
  Forms with six or fewer fields normally use a modal. Detail pages use a
  responsive wide-screen-first layout.
- Dedicated create/edit page actions such as back and save belong in the
  top-right page header.
- Business pages use `@/components/AdminPage` for the same `GridContent`
  boundary as `dashboard/analysis`, plus a compact title and breadcrumbs.
  Do not add `PageContainer` padding or page descriptions. All new UI copy
  requires both `zh-CN` and `en-US` entries.
- The global header contains only the language switcher and user dropdown.
  Do not restore documentation/version buttons or the floating SettingDrawer.
  User avatars display the configured image and fall back to initials derived
  from the displayed name.

## Runtime storage and secrets

- Default paths are relative to `apps/api` and point into the root `storage` tree.
- Store image, video, and generic file uploads in their matching subdirectories.
- The API writes its default file log to `storage/logs/app.log`.
- Store provider payment certificates under `storage/certificates/payment` and
  reference them through environment variables. Never embed certificate contents
  or private keys in code, fixtures, logs, prompts, or Git.
- Production deployments must mount persistent upload storage and inject secrets.
  Directory `.gitkeep` files only preserve the expected layout.

## Git policy

Commit source, migrations, tests, documentation, public static assets, dependency
manifests, the root `package-lock.json`, `.env.example`, and directory placeholders.
Do not commit generated builds, dependency directories, local IDE state, `.env`
files, runtime storage contents, logs, databases, private certificate formats, or
the generated `apps/api/public/admin` and `apps/api/public/h5` trees.

Use conventional commit messages. Do not commit or push unless the user explicitly
asks. Preserve unrelated user changes, and never regenerate or rewrite broad areas
of the project to solve a narrow task.

## Keeping AI context accurate

- Inspect the nearest `AGENTS.md`, existing patterns, and package scripts before
  editing.
- Do not guess framework APIs. Check installed types or current official docs.
- Update README files, `.env.example`, migrations, and tests together when a public
  contract changes.
- Prefer explicit names over catch-all `utils` modules. Keep domain concepts in the
  same vocabulary across API routes, database models, and frontend services.
- Do not edit generated code by hand. Change its source schema/configuration and
  regenerate it with the documented command.
