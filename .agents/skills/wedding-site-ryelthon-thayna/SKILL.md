---

name: wedding-site-ryelthon-thayna
description: Project-specific engineering and product rules for the Ryelthon and Thayna wedding website. Use whenever implementing, refactoring, reviewing, testing, or making architectural decisions in this repository. Defines the approved stack, RSVP business rules, admin behavior, security constraints, design direction, and scope boundaries.
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Ryelthon & Thayna Wedding Website

## Purpose

This skill contains project-specific rules for the wedding website of Ryelthon and Thayna.

Wedding date:

* December 10, 2026

Use this skill whenever working on:

* architecture;
* frontend implementation;
* RSVP;
* invitations;
* guest management;
* admin dashboard;
* authentication;
* database;
* validation;
* testing;
* UI/UX;
* refactoring;
* deployment.

Treat these rules as project constraints unless explicitly changed by the project owner.

---

# 1. Product goals

Build a public wedding website that:

* presents the wedding elegantly;
* communicates date, time, location and dress code;
* includes a countdown;
* allows invited guests to RSVP;
* prevents unregistered people from submitting RSVP responses;
* gives the couple a simple administrative interface;
* remains easy to maintain;
* avoids unnecessary architectural complexity.

The project should favor:

1. correctness;
2. simplicity;
3. good mobile UX;
4. maintainability;
5. security;
6. visual quality;
7. performance.

---

# 2. Approved stack

Use:

* Next.js;
* TypeScript;
* App Router;
* Tailwind CSS;
* Prisma ORM;
* SQLite for local development;
* libSQL/Turso for production;
* Zod for validation;
* Vercel for deployment.

Testing may use:

* Vitest for unit tests;
* Playwright for end-to-end tests.

Do not introduce another framework or infrastructure layer unless there is a concrete technical requirement.

---

# 3. Architecture

Keep the application as a single Next.js project.

Preferred flow:

User
→ Next.js
→ Server Actions / Route Handlers
→ Service layer
→ Prisma
→ SQLite/libSQL

Do not create a separate backend.

Do not introduce:

* microservices;
* Kafka;
* Redis;
* event buses;
* CQRS;
* GraphQL;
* Docker infrastructure;
* Kubernetes;
* separate API projects;
* unnecessary state-management libraries.

Prefer direct and explicit code over abstract frameworks.

---

# 4. Next.js conventions

Prefer:

* Server Components by default;
* Client Components only when browser interaction is required;
* Server Actions for application mutations;
* Route Handlers when HTTP endpoints are genuinely useful;
* `next/image` for images;
* `next/font` when appropriate;
* Next.js metadata API for SEO.

Avoid converting large page trees into Client Components.

Do not expose database calls directly inside arbitrary presentation components.

---

# 5. Code organization

Prefer clear separation between:

* UI;
* validation;
* business rules;
* database access;
* authentication.

Suggested organization:

```text
src/
├── app/
├── actions/
├── components/
│   ├── ui/
│   ├── wedding/
│   ├── rsvp/
│   └── admin/
├── services/
├── lib/
├── schemas/
├── types/
└── constants/

prisma/
├── schema.prisma
└── seed.ts

tests/
├── unit/
└── e2e/
```

This is a guideline, not a mandatory abstraction.

Do not create files or layers that contain no meaningful logic.

---

# 6. Public website

The public website should include:

* Hero;
* couple names;
* wedding date;
* wedding time;
* venue;
* address;
* map/location action;
* dress code;
* selected photography;
* countdown;
* RSVP;
* footer.

The couple story section is optional and not part of the mandatory MVP.

---

# 7. Design direction

The public website must feel:

* elegant;
* premium;
* editorial;
* sophisticated;
* romantic;
* minimal.

Prefer:

* generous whitespace;
* strong typography;
* large photography;
* serif display typography;
* clean sans-serif body typography;
* restrained decoration;
* subtle motion;
* clear visual hierarchy.

Avoid:

* generic wedding-template aesthetics;
* excessive flowers;
* excessive gradients;
* excessive card layouts;
* dashboard-looking public pages;
* particle effects;
* excessive parallax;
* unnecessary glassmorphism;
* intrusive animations.

Use the wedding's actual visual identity once provided.

---

# 8. Admin design

The admin interface should prioritize usability over decorative styling.

It may use standard reusable UI components.

The admin must be:

* clean;
* responsive;
* functional;
* accessible;
* easy to scan.

Do not reuse the elaborate public wedding design when it harms administrative usability.

---

# 9. Invitation model

An invitation represents a group.

Example:

```text
Invitation:
Família Silva

Guests:
- João Silva
- Maria Silva
```

Each invitation has one unique invitation code.

A code may represent multiple guests.

---

# 10. Invitation codes

Invitation codes must:

* be generated automatically;
* be unique;
* be non-sequential;
* be difficult to guess;
* avoid ambiguous characters when reasonable.

Do not use numeric sequential IDs as public invitation codes.

Good:

```text
K7XP92
M4Q8LA
```

Bad:

```text
0001
0002
```

Normalize submitted codes before comparison.

Code input should preferably be case-insensitive.

---

# 11. RSVP access

Guests must not be searchable publicly by name.

A visitor accesses RSVP through an invitation code.

When a valid code is submitted:

* load only that invitation;
* load only guests associated with that invitation.

Never expose the complete guest list.

For invalid codes, return a generic error.

Do not reveal whether a specific person's name exists in the database.

---

# 12. RSVP rules

Each guest has an individual RSVP status.

Supported states:

```ts
PENDING
CONFIRMED
DECLINED
```

Display:

```text
PENDING   → Aguardando resposta
CONFIRMED → Confirmado
DECLINED  → Não irá
```

A group may therefore contain mixed answers.

Example:

```text
João  → CONFIRMED
Maria → DECLINED
```

---

# 13. No +1

Guests cannot add arbitrary people.

Do not implement:

* "+1";
* guest-created attendees;
* custom names;
* public guest creation.

Only administrator-created guests may RSVP.

---

# 14. Children

Children do not need to RSVP.

When useful, represent this through:

```ts
requiresRsvp: boolean
```

Default:

```text
Adult → true
Child → false
```

Guests with `requiresRsvp = false` must not be counted as pending RSVP responses.

---

# 15. Optional RSVP information

The RSVP may contain optional:

* phone;
* dietary restriction;
* notes;
* message to the couple.

These fields must not prevent RSVP submission when empty.

---

# 16. Updating RSVP

Guests may use the same invitation code again before the deadline.

Existing responses should be loaded.

The guest may change their response.

The latest valid response becomes the active response.

Store the response/update timestamp.

---

# 17. RSVP deadline

There must be a configurable RSVP deadline.

After the deadline:

* do not accept new RSVP responses;
* do not accept RSVP modifications;
* display an informative message.

The deadline must be validated server-side.

Never rely only on disabled frontend controls.

---

# 18. RSVP validation

All RSVP writes must be validated on the server.

Use Zod or equivalent project validation schemas.

When receiving guest IDs, verify that every guest belongs to the invitation associated with the submitted invitation code.

Never trust:

* invitationId;
* guestId;
* RSVP status;
* client-side validation;

without server verification.

---

# 19. Admin functionality

The authenticated administrator must be able to:

* view dashboard;
* create invitation;
* edit invitation;
* delete invitation;
* copy invitation code;
* create guests;
* edit guests;
* remove guests;
* search invitations/guests;
* filter by RSVP status;
* inspect RSVP information;
* export guest data to CSV.

---

# 20. Dashboard metrics

Dashboard metrics are based primarily on people, not invitation groups.

Include:

* total RSVP-eligible guests;
* confirmed;
* declined;
* pending;
* total people confirmed.

Guests that do not require RSVP should not incorrectly inflate the pending metric.

---

# 21. Admin authentication

MVP uses a simple administrative login.

Do not build:

* social login;
* guest accounts;
* role systems;
* multiple admin permission levels;

unless requirements change.

Passwords must never be stored as plaintext.

Use a secure password hashing algorithm.

Preferred examples:

* Argon2;
* bcrypt.

---

# 22. Sessions

Authentication must use secure server-managed sessions.

Session cookies should be:

* HTTP-only;
* Secure in production;
* configured with appropriate SameSite policy;
* expiring.

Admin authorization must be verified on the server.

Never rely only on frontend redirects for route protection.

---

# 23. Database

Use Prisma as the primary ORM.

Development:

* local SQLite.

Production:

* libSQL/Turso.

Do not store the production SQLite database file on Vercel's filesystem.

Persist production data externally.

---

# 24. Data model

Core domain:

```text
Invitation
   |
   └── Guest
```

Administrative domain:

```text
AdminUser
   |
   └── AdminSession
```

Keep the schema simple.

Do not introduce generic repository abstractions unless they provide a concrete benefit.

---

# 25. Validation

Prefer centralized Zod schemas for:

* login;
* invitation creation;
* invitation update;
* guest creation;
* guest update;
* invitation code;
* RSVP submission.

Validation must happen server-side even when equivalent client validation exists.

---

# 26. Error handling

Never expose to public users:

* SQL errors;
* Prisma errors;
* stack traces;
* infrastructure details;
* session tokens;
* secrets.

Translate failures into understandable UI states.

Use clear states:

```text
idle
loading
success
error
empty
```

---

# 27. Security

Protect against:

* guest enumeration;
* unauthorized admin access;
* manipulation of guest IDs;
* session theft;
* accidental secret exposure;
* insecure password storage;
* unvalidated mutations.

Consider rate limiting invitation-code attempts if abuse becomes relevant.

Do not add security infrastructure solely for complexity's sake.

---

# 28. CSV export

CSV export must:

* require admin authentication;
* use UTF-8;
* contain readable status values;
* open correctly in Excel and Google Sheets.

Suggested fields:

* guest name;
* invitation;
* invitation code;
* RSVP status;
* phone;
* dietary restriction;
* notes;
* message;
* response date.

---

# 29. Accessibility

Interactive elements must have:

* accessible names;
* labels;
* visible focus states;
* keyboard usability;
* appropriate semantic HTML.

Maintain adequate contrast.

Respect `prefers-reduced-motion` when adding animations.

Do not sacrifice accessibility for decorative design.

---

# 30. Responsive behavior

Design mobile-first.

The public site must work particularly well on smartphones because mobile is expected to be the primary guest experience.

Test at minimum:

* small mobile;
* large mobile;
* tablet;
* desktop.

Avoid layouts that only look correct at desktop widths.

---

# 31. Performance

Prefer:

* Server Components;
* optimized images;
* minimal client JavaScript;
* lazy loading where useful;
* optimized fonts;
* simple animation techniques.

Do not install heavy animation or state libraries for trivial interactions.

---

# 32. SEO and sharing

Configure:

* title;
* description;
* favicon;
* Open Graph metadata;
* social sharing image.

The wedding site should present correctly when shared through messaging applications.

Do not expose private RSVP information in metadata.

---

# 33. Testing strategy

Prioritize tests around business-critical behavior.

Unit/integration tests should cover:

* invitation-code generation;
* invitation-code normalization;
* RSVP deadline;
* RSVP status calculations;
* validation;
* dashboard counts.

End-to-end tests should cover:

1. admin login;
2. invitation creation;
3. guest creation;
4. copying/using invitation code;
5. public RSVP lookup;
6. individual RSVP responses;
7. editing an existing RSVP;
8. admin dashboard reflecting the response;
9. invalid invitation code;
10. expired RSVP deadline.

Do not chase arbitrary coverage percentages.

Test behavior that could realistically break the wedding workflow.

---

# 34. Scope control

Do not implement features not requested.

Currently out of scope:

* gift registry;
* payment;
* Pix;
* guest accounts;
* public registration;
* +1;
* photo uploads;
* complete gallery;
* comments;
* chat;
* WhatsApp API;
* automatic invitation delivery;
* mobile app;
* multiple admin roles;
* internationalization;
* microservices.

When an attractive extra feature appears during implementation, do not silently add it.

Mention it separately instead.

---

# 35. Decision-making rule

When multiple implementations are valid, prefer the one that is:

1. simpler;
2. easier to maintain;
3. secure enough for the actual risk;
4. easier to test;
5. aligned with native Next.js patterns;
6. less dependent on unnecessary third-party services.

Avoid cleverness.

---

# 36. Before implementing a feature

Before making substantial changes:

1. inspect the existing implementation;
2. identify relevant project requirements;
3. check whether an existing pattern already solves the problem;
4. avoid duplicating components or logic;
5. understand database impact;
6. implement the smallest complete solution.

---

# 37. After implementing a feature

Before considering work complete:

1. run relevant type checks;
2. run linting if configured;
3. run applicable tests;
4. check server-side validation;
5. check mobile layout when UI changed;
6. check empty/loading/error states;
7. ensure no secrets or private guest data are exposed;
8. ensure unrelated functionality was not changed.

---

# 38. Definition of done

A feature is not done merely because the happy path renders.

It should account for relevant:

* validation;
* authorization;
* errors;
* loading;
* empty states;
* mobile behavior;
* accessibility;
* persistence;
* tests.

Keep this proportional to the feature's importance.

---

# 39. Do not override project requirements

If a generic skill conflicts with this skill or the project's requirements documentation:

1. project requirements win;
2. this project skill wins over generic stylistic recommendations;
3. document the conflict when technically important.

Do not silently change product rules because a generic framework skill recommends a different architecture.
