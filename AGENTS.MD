# AGENTS.md

## Project

Wedding website for **Ryelthon & Thayna**.

Wedding date:

**December 10, 2026**

This repository contains both:

* the public wedding website;
* the private administrative dashboard.

The project must remain a **single Next.js application**.

---

# 1. Read before working

Before implementing or modifying substantial functionality:

1. Read `docs/PRD.md`.
2. Read `docs/TECHNICAL_SPEC.md`.
3. Read the project skill:
   `.agents/skills/wedding-site-ryelthon-thayna/SKILL.md`.
4. Inspect the existing implementation before proposing a new abstraction.
5. Reuse existing patterns when they are appropriate.

Product requirements take precedence over generic framework recommendations.

If documentation conflicts:

1. explicit user request;
2. `docs/PRD.md`;
3. `docs/TECHNICAL_SPEC.md`;
4. project-specific skill;
5. generic skills.

---

# 2. Approved stack

Use:

* Next.js;
* App Router;
* TypeScript;
* Tailwind CSS;
* Prisma ORM;
* SQLite locally;
* Turso/libSQL in production;
* Zod;
* Vercel;
* Vitest;
* Playwright.

Do not change the primary stack without an explicit requirement.

---

# 3. Architecture constraints

Keep the system simple.

Use:

```text
Next.js
   ↓
Server Actions / Route Handlers
   ↓
Service / domain logic
   ↓
Prisma
   ↓
SQLite / Turso
```

Do not introduce:

* separate backend;
* microservices;
* GraphQL;
* Redis;
* Kafka;
* queues;
* event buses;
* CQRS;
* Kubernetes;
* Docker infrastructure;
* Redux;
* global state libraries without demonstrated need.

Prefer native Next.js capabilities.

---

# 4. Next.js rules

Use Server Components by default.

Add `"use client"` only when browser-side interaction actually requires it.

Good reasons include:

* form interaction;
* countdown timer;
* modal state;
* clipboard API;
* interactive filters;
* browser-only APIs.

Do not convert parent layouts or entire page trees into Client Components simply because one child needs interactivity.

Prefer Server Actions for mutations.

Use Route Handlers where an actual HTTP endpoint is useful, such as CSV downloads or integration boundaries.

---

# 5. Business logic

Do not place substantial business rules directly inside React components.

Keep rules such as:

* RSVP deadline;
* invitation validation;
* dashboard counts;
* guest eligibility;
* invitation code generation;
* authorization;

in reusable server-side functions.

UI components should primarily:

* render;
* collect input;
* display state.

---

# 6. Database

Prisma is the approved ORM.

Local development uses SQLite.

Production uses Turso/libSQL through Prisma's libSQL adapter.

Never use a local `.db` file as production persistence on Vercel.

Never expose database credentials to client-side code.

---

# 7. Prisma migrations

Local schema development may use normal Prisma migration workflows against SQLite.

Do not assume that remote Turso schema migrations work exactly like local SQLite migrations.

Before changing the production schema:

1. generate/review migration SQL;
2. verify compatibility;
3. apply migration to Turso through the approved migration workflow;
4. do not destructively alter production data without review.

Never execute destructive production migrations casually.

---

# 8. Data model constraints

Core relationship:

```text
Invitation
    |
    └── Guest[]
```

A single invitation may contain multiple guests.

Each invitation has one public code.

Each RSVP-eligible guest has an individual status:

```text
PENDING
CONFIRMED
DECLINED
```

Never treat an invitation-level answer as the guest-level source of truth.

---

# 9. Invitation codes

Invitation codes must:

* be unique;
* be random;
* not use sequential IDs;
* be difficult to guess;
* preferably avoid ambiguous characters;
* be normalized before lookup.

Never expose internal database IDs as invitation codes.

Do not allow public lookup by guest name.

---

# 10. RSVP security

When submitting RSVP:

Never trust a `guestId` merely because the browser sent it.

The server must verify:

1. invitation code is valid;
2. invitation exists;
3. submitted guests belong to that invitation;
4. guests are RSVP eligible;
5. deadline is still open;
6. submitted status is valid.

Only then persist changes.

---

# 11. Guest privacy

Never expose:

* the entire guest list;
* another invitation;
* phone numbers publicly;
* dietary restrictions publicly;
* private messages publicly;
* admin data;
* database identifiers unnecessarily.

Public code lookup may reveal only the invitation associated with the submitted code.

Invalid codes must produce generic responses.

---

# 12. Authentication

Administrative functionality must be server protected.

A client-side redirect is not authorization.

Every administrative mutation must verify an authenticated admin session.

Passwords must be hashed using a secure password hashing algorithm.

Never store plaintext passwords.

Session cookies must be:

* HTTP-only;
* Secure in production;
* appropriately SameSite;
* expiring.

---

# 13. Validation

Use Zod for user-controlled input.

Validate on the server even if equivalent frontend validation exists.

Expected schemas include:

* login;
* invitation code;
* create invitation;
* edit invitation;
* create guest;
* edit guest;
* RSVP.

Do not trust TypeScript types as runtime validation.

---

# 14. Error handling

Do not display raw technical errors to users.

Never display:

* Prisma errors;
* stack traces;
* SQL;
* environment variables;
* tokens;
* filesystem paths.

Log server-side failures appropriately and return user-friendly messages.

---

# 15. Public design

The public site must feel:

* elegant;
* premium;
* editorial;
* minimal;
* romantic;
* sophisticated.

Avoid:

* generic SaaS design;
* excessive cards;
* dashboard-looking sections;
* excessive gradients;
* excessive glassmorphism;
* decorative overload;
* random stock UI patterns.

Prioritize:

* typography;
* whitespace;
* imagery;
* hierarchy;
* subtle animation.

---

# 16. Admin design

Admin should prioritize usability.

It may use more conventional UI patterns:

* cards;
* tables;
* dialogs;
* forms;
* badges;
* filters;
* toast notifications.

Do not force public wedding aesthetics into data-heavy admin screens when it hurts usability.

---

# 17. Responsive requirements

Build mobile-first.

The public website should be considered primarily a smartphone experience.

At minimum verify:

* ~375px mobile;
* large mobile;
* tablet;
* desktop.

Do not accept horizontal overflow.

---

# 18. Accessibility

When changing UI, verify:

* labels;
* semantic markup;
* keyboard navigation;
* visible focus;
* color contrast;
* alt text;
* button semantics;
* form error association;
* reduced-motion behavior where applicable.

Do not remove visible focus styles.

---

# 19. Performance

Avoid unnecessary Client Components.

Optimize images.

Prefer `next/image`.

Avoid unnecessarily large dependencies.

Do not add animation libraries for effects easily handled by CSS unless they provide clear value.

Keep the initial public experience lightweight.

---

# 20. Scope

Do not silently add new product features.

Currently out of scope:

* gift registry;
* Pix;
* payments;
* guest accounts;
* public sign-up;
* +1;
* WhatsApp API;
* automatic invitation sending;
* photo uploads;
* comments;
* chat;
* mobile application;
* multiple admin roles;
* multilingual support.

Suggest extras separately rather than implementing them without request.

---

# 21. Before editing code

For meaningful tasks:

1. inspect relevant files;
2. inspect related tests;
3. understand existing conventions;
4. identify affected business rules;
5. determine database impact;
6. make the smallest coherent change.

Do not rewrite unrelated code.

---

# 22. After editing code

Run relevant checks.

Expected commands should eventually include equivalents of:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Not every command must run for every tiny change, but changes must receive proportionate verification.

---

# 23. Database changes

Whenever `schema.prisma` changes:

1. explain the model impact;
2. create/review the migration;
3. regenerate Prisma Client when needed;
4. update seed if relevant;
5. update tests;
6. consider production Turso migration requirements.

Do not delete or rename persisted fields without considering existing data.

---

# 24. Tests

Prioritize behavior over arbitrary coverage percentages.

Critical areas:

* authentication;
* invitation code lookup;
* guest ownership validation;
* RSVP deadline;
* changing an RSVP;
* dashboard totals;
* CSV export;
* admin authorization.

Add tests for bugs when practical.

---

# 25. E2E critical path

The following flow should remain functional:

```text
Admin logs in
   ↓
Creates invitation
   ↓
Adds two guests
   ↓
Receives invitation code
   ↓
Public visitor enters code
   ↓
Invitation loads
   ↓
Guest A confirms
Guest B declines
   ↓
Response is saved
   ↓
Admin dashboard shows:
1 confirmed
1 declined
```

Breaking this flow is considered a critical regression.

---

# 26. Quality standard

A feature is not complete just because the happy path renders.

When applicable, account for:

* loading;
* errors;
* empty state;
* validation;
* authorization;
* persistence;
* mobile;
* accessibility.

Keep implementation proportional to the feature.

---

# 27. Avoid overengineering

Prefer:

```ts
function calculateDashboardStats(guests) {
  // direct readable logic
}
```

over introducing generic patterns solely because they are commonly associated with enterprise applications.

Do not introduce:

* repository interfaces;
* abstract factories;
* event dispatchers;
* command buses;
* domain frameworks;

unless the project actually develops a need for them.

---

# 28. Dependencies

Before adding a package:

1. check whether platform/native APIs already solve the problem;
2. check whether an existing dependency solves it;
3. ensure the package has meaningful benefit;
4. avoid overlapping libraries.

Do not install multiple libraries for the same responsibility.

---

# 29. Secrets

Never commit:

```text
.env
.env.local
TURSO_AUTH_TOKEN
session secrets
production admin credentials
```

Provide `.env.example` with variable names only.

---

# 30. Git hygiene

Keep commits and changes focused.

Do not reformat unrelated files.

Do not mass-rewrite working code without explicit need.

Preserve existing functionality unless requirements intentionally change it.

---

# 31. Definition of done

Before marking substantial work complete, verify:

* requirements satisfied;
* TypeScript valid;
* validation implemented;
* security boundary preserved;
* mobile UI checked;
* error state covered;
* relevant tests pass;
* no private data exposed;
* no unnecessary feature added.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
