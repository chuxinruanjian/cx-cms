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
├── package.json             # npm workspace commands
└── AGENTS.md                # Repository-wide instructions (this file)
```

Do not confuse these areas:

- Server controllers, models, validators, jobs, and integrations belong in
  `apps/api`.
- Desktop management UI pages and components belong in `apps/admin`.
- Mobile browser UI belongs in `apps/h5`, never in the admin app.
- Runtime files belong in `storage`, never beside source files or in `public`.

The more specific `apps/admin/AGENTS.md` also applies to admin changes.

## Commands

Run commands from the repository root unless noted otherwise.

- `npm install`: install every workspace from the single root lockfile.
- `npm run dev`: start API and admin development servers together.
- `npm run dev:api`: start only AdonisJS on port 3333.
- `npm run dev:admin`: start only Ant Design Pro on port 8000.
- `npm run build`: build all implemented applications.
- `npm run lint`: lint all implemented applications.
- `npm run typecheck`: type-check API and admin.
- `npm test`: run all workspace tests.
- `npm run db:migrate`: apply Lucid migrations.
- `npm run db:rollback`: roll back the latest Lucid migration batch.

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

## Frontend rules

- Admin API requests use relative `/api/v1/...` URLs. Development proxying is
  configured in `apps/admin/config/proxy.ts`; production routing is infrastructure.
- Do not duplicate backend validation rules as the only source of truth.
- Keep page-specific files co-located in the page directory.
- Read and follow `apps/admin/AGENTS.md` before editing the admin application,
  especially its generated-service and Ant Design API rules.
- `apps/h5` currently has no selected framework. Do not initialize one unless the
  task explicitly chooses the H5 stack; when initialized, add it to root workspaces.

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
files, runtime storage contents, logs, databases, or private certificate formats.

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
