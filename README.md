# Ryelthon & Thayna — M4 Admin Authentication

One Next.js App Router application. Milestones M1 through M4 are implemented.
The `/` route contains the public wedding page with a hero, countdown, event
details, venue, dress code, photo placeholders, RSVP, and footer. The protected
administrative area currently contains authentication only; management remains M5.

## Public content and M2 boundaries

Confirmed names/date and pending venue/dress-code content live in
`src/constants/wedding.ts`. The date is December 10, 2026, in America/Fortaleza.
Until a ceremony time is configured, the countdown targets the beginning of
that day (`2026-12-10T00:00:00-03:00`) and the page says the time is pending.
A valid `WEDDING_DATE` with an explicit offset can set the ceremony time; it
must still fall on the confirmed wedding day in Fortaleza. Changing these
settings on a deployed static page requires a rebuild.

No venue, address, attire, photos, or permanent visual identity was invented.
The map link only renders once a real `mapUrl` is supplied. Photo spaces are
neutral HTML/CSS placeholders, with no external images or broken image requests.
Replace them with optimized `next/image` assets when the couple supplies photos.
Bridal and Boheme Floral remain the named typography roles, using system serif
fallbacks until licensed font files arrive. The supporting font uses a system
sans-serif fallback until the final choice is confirmed. No font downloads or
new application dependencies were introduced in M2.

The page/layout remain Server Components; only the countdown is interactive.
It supports pause/resume, avoids per-second screen-reader announcements, handles
the reached-date state without negative values, and offers a no-JavaScript
explanation. The RSVP section supports code lookup, grouped individual responses,
optional information, edits, server-authoritative deadlines, and persistence.

Title, description, Open Graph text, and Twitter metadata are configured.
Canonical metadata uses `NEXT_PUBLIC_SITE_URL` only when supplied. Search
indexing stays disabled while real content is pending. Final favicon, social
image, photos, and font integration remain visual-polish work in M7.

## Local setup

Use Node.js 24 and npm. Dependencies are pinned in `package.json` and
`package-lock.json`; use `npm ci` on a fresh checkout.

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. Public pages need no credentials.
The default SQLite file is `prisma/dev.db`, ignored by Git. The CLI and runtime
resolve local paths from the project root to avoid creating separate databases.
Run commands from the project root.

To customize configuration, copy `.env.example` to `.env`. Example local values:

```env
DATABASE_URL=file:./prisma/dev.db
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_SECRET=replace-with-at-least-32-random-characters
ADMIN_INITIAL_USERNAME=admin
ADMIN_INITIAL_PASSWORD=replace-with-a-strong-password
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
When both initial-admin variables are supplied, the seed creates the administrator
once with a salted scrypt hash. Later seed runs never overwrite its password.

Schema changes use `npm run db:migrate -- --name descriptive_name`, followed by
`npm run db:generate`. Generation also runs during install, typecheck, tests, and
build. No migrations or seeding run as part of builds.

## Production boundary

When `NODE_ENV=production`, database access requires `TURSO_DATABASE_URL`
(`libsql://` or HTTPS) and `TURSO_AUTH_TOKEN`. It cannot fall back to local SQLite.
Only `NEXT_PUBLIC_SITE_URL` is intended as browser-visible configuration.

`SESSION_SECRET` is required by production validation and authentication at runtime.
The initial-admin variables are consumed by the local seed or, when the production
database has no administrator yet, once during the first login attempt. The account
is persisted with a salted hash; subsequent authentication uses only the stored
record. Configure both variables together and remove or rotate the plaintext
bootstrap password after confirming access. Supplied settings are validated. The
site consumes `WEDDING_DATE` and `NEXT_PUBLIC_SITE_URL` without requiring database credentials.
No ceremony time or RSVP deadline has been invented. The documented event
timezone is America/Fortaleza.

Vercel should use Node 24 and the normal Next.js preset with `npm run build`.
Review pending content and indexing before production deployment.

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

Playwright starts and stops a dedicated isolated `next dev` on port 3100 and checks the
public page at 375, 430, 768, and 1280 pixels. It covers structure, metadata,
browser exceptions, keyboard skip/section links, countdown updates/pause/resume,
the reached-date state, and 320px reflow with 200% font size and expanded text
spacing. It also covers RSVP and the complete M4 login/session/logout flow.

Next.js permits only one dev server per checkout. To test an existing server,
set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000` for the test command; otherwise
stop your existing dev server before running `npm run test:e2e`.

M1 verification completed: lint and typecheck passed, all 8 Vitest tests and
4 Playwright checks passed, production build passed, and a repeated migration
reported the database in sync followed by a successful second seed run.

M2 verification completed: lint, typecheck, production build, 13 Vitest tests,
and 16 Playwright checks passed. Next's MCP endpoint reported no compilation or
runtime errors. agent-browser 0.37.1 confirmed the server-rendered page and isolated
Countdown component; desktop/mobile screenshots were inspected. Its axe-core
4.12.1 scan reported zero violations. The two decorative arrows marked incomplete
by the scanner use measured foreground/background contrast of 13.62:1 and 6.77:1.
Keyboard navigation, text reflow, and reduced-motion behavior were browser tested;
no real screen-reader session was performed, so this is not a WCAG conformance claim.

## Structure

- `src/app/`: public page, admin login, protected admin shell, metadata, and design tokens.
- `src/actions/`: validated RSVP and authentication Server Actions.
- `src/components/wedding/`: interactive countdown.
- `src/constants/wedding.ts`: public event information and pending content.
- `src/lib/`: environment/database infrastructure, password/session primitives, countdown, and dates.
- `src/schemas/`: Zod schemas for environment, RSVP, and authentication input.
- `prisma/`: schema, initial migration, development seed.
- `tests/`: unit, database integration, and foundation browser tests.

The application follows the documented architecture:
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
- Admin management remains M5. Event time, venue, RSVP deadline, final
  font files/assets, and supporting font choice remain future product/UI decisions.

No stack or domain-model deviations were introduced. M1 scope choices were the
empty-value environment template, optional development admin seed omitted, and
meaningful folders only. The repository originally had no `.git` directory;
M1 task did not initialize Git or create commits. Git was initialized before M2.
M2 through M4 add no database schema changes.

M4 verification completed: lint, typecheck, production build, 26 Vitest tests,
and 28 Playwright checks passed. Playwright covered missing and forged sessions,
generic credential errors, successful login, secure cookie attributes, protected
route access, server-side logout invalidation, and all previous public flows.
