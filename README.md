# Ryelthon & Thayna — M1 Foundation

One Next.js App Router application. Only Milestone M1 is implemented.
The `/` route is a neutral, non-indexed placeholder. Public wedding design,
RSVP, authentication, admin screens, and deployment are deferred.

## Local setup

Use Node.js 24 and npm. Dependencies are pinned in `package.json` and
`package-lock.json`; use `npm ci` on a fresh checkout.

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. No credentials are needed for M1 local development.
The default SQLite file is `prisma/dev.db`, ignored by Git. The CLI and runtime
resolve local paths from the project root to avoid creating separate databases.
Run commands from the project root.

To customize configuration, copy `.env.example` to `.env`. Example local values:

```env
DATABASE_URL=file:./prisma/dev.db
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.example` deliberately has empty values only. The Prisma CLI and seed load
`.env` using dotenv; Next.js loads its usual environment files. Keep shared DB
configuration in `.env`, rather than `.env.local`, so all three use the same URL.
Never commit environment files, credentials, generated clients, or SQLite files.

## Database and seed

`prisma/schema.prisma` contains the four specified models: `Invitation`, `Guest`,
`AdminUser`, and `AdminSession`. The initial migration adds their tables,
unique constraints, indexes, and cascading foreign keys. RSVP status is stored
on each guest. SQLite stores the enum as text; future writes must validate
user input with Zod. There are no public database endpoints in M1.

`src/lib/db.ts` exposes server-only `getDb()`, with a development singleton.
The same libSQL adapter supports local SQLite and remote Turso. Database access
is lazy, so static builds and client generation do not require production secrets.
Environment validation happens before creating or returning the database client.

The development-only seed creates one **Família Teste** invitation and two
RSVP-eligible, pending guests, **João Teste** and **Maria Teste**. Re-running it
does not duplicate records or overwrite edits. Its fixed fixture code is local
test data, not a production code generator. The seed refuses production execution.
It does not create admin credentials; bootstrap and password hashing belong to M4.

Schema changes use `npm run db:migrate -- --name descriptive_name`, followed by
`npm run db:generate`. Generation also runs during install, typecheck, tests, and
build. No migrations or seeding run as part of builds.

## Production boundary

When `NODE_ENV=production`, database access requires `TURSO_DATABASE_URL`
(`libsql://` or HTTPS) and `TURSO_AUTH_TOKEN`. It cannot fall back to local SQLite.
Only `NEXT_PUBLIC_SITE_URL` is intended as browser-visible configuration.

The remaining documented variables are reserved for later milestones:
`SESSION_SECRET`, `ADMIN_INITIAL_USERNAME`, `ADMIN_INITIAL_PASSWORD`,
`WEDDING_DATE`, and `RSVP_DEADLINE`. Supplied secrets/dates/site URLs are validated;
authentication and event settings are not required by this unused M1 infrastructure.
Future feature boundaries must require the values they use. No ceremony time or
RSVP deadline has been invented. The documented event timezone is America/Fortaleza.

Vercel should use Node 24 and the normal Next.js preset with `npm run build`.
Do not deploy this placeholder as the completed wedding site.

Prisma CLI configuration targets **local SQLite only**. Production migration
automation is deliberately absent: review the generated SQL, verify Turso
compatibility and backups, then apply it through the approved Turso workflow
before deploying dependent code. No remote schema or production data was touched.

## Verification

```sh
npm run lint
npm run typecheck
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
```

Vitest covers environment validation, production/local separation, development
client reuse, applying the committed migration to an isolated SQLite database,
seed repeatability, foreign keys, uniqueness, and cascade behavior. Test database
artifacts remain under ignored `test-results/database/` because native SQLite
file handles can remain locked until the worker process exits on Windows.

Playwright starts and stops a dedicated `next dev` on port 3100 and checks the
placeholder at 375, 430, 768, and 1280 pixels for rendering, browser exceptions,
language, and horizontal overflow. It contains no future product-flow tests.

M1 verification completed: lint and typecheck passed, all 8 Vitest tests and
4 Playwright checks passed, production build passed, and a repeated migration
reported the database in sync followed by a successful second seed run.

## Structure

- `src/app/`: root layout, Tailwind entrypoint, and neutral placeholder route.
- `src/lib/`: server-only environment/database access and shared local URL handling.
- `src/schemas/`: Zod environment schema.
- `prisma/`: schema, initial migration, development seed.
- `tests/`: unit, database integration, and foundation browser tests.

Actions, services, components, and feature-specific schemas will be added when
they contain real functionality, following the documented architecture:
Next.js → Server Actions/Route Handlers → domain logic → Prisma → SQLite/Turso.

## Version choices and remaining decisions

There were no installed packages or existing implementation to reconcile.
The documentation does not pin package versions. The foundation pins Next.js
16.3.4, React 19.2.8, Prisma/adapter 7.10.0, Tailwind 4.3.3, TypeScript 5.9.3,
Zod 4.5.4, Vitest 5.0.0, and Playwright 1.63.0.

- Prisma 7.10.0 is pinned instead of the registry's Prisma 8 release-candidate
  `latest` tag. Its actual adapter export is `PrismaLibSql`, and CLI datasource
  configuration lives in `prisma.config.ts`; the technical spec's code is conceptual.
- ESLint 9.39.5 satisfies Next's installed plugins. npm marks it unsupported;
  ESLint 10 currently conflicts with their declared peer ranges. Revisit together
  with the Next lint plugins before production.
- At implementation, both `npm audit` and `npm audit --omit=dev` reported four
  high-severity entries in the Prisma CLI dependency tree (`prisma`,
  `@prisma/config`, `deepmerge-ts`, `mysql2`). Although the CLI is declared as a
  dev dependency, npm also includes it through Prisma Client's peer relationship.
  No MySQL connection or user-controlled CLI config is used. A compatible
  upstream resolution remains outstanding; no forced downgrade
  or unverified major transitive override was applied.
- Turso credentials, the exact approved remote migration procedure, and Vercel
  provisioning remain M8 work. Remote connectivity has not been tested.
- Admin bootstrap/hashing remains M4. Event time, venue, RSVP deadline, final
  font files/assets, and supporting font choice remain future product/UI decisions.

No stack or domain-model deviations were introduced. Scope choices are the
empty-value environment template, optional development admin seed omitted, and
meaningful folders only. The repository originally had no `.git` directory;
this task did not initialize Git or create commits. M2 has not been started.
