# TECHNICAL_SPEC.md

## Ryelthon & Thayna Wedding Website

Version: 1.0

Wedding date: **2026-12-10**

---

# 1. Objective

This document defines how the wedding website should be implemented.

Product behavior is defined in `docs/PRD.md`.

This document defines:

* technical architecture;
* routes;
* data model;
* validation;
* authentication;
* RSVP workflow;
* admin workflow;
* database access;
* security;
* testing;
* deployment;
* implementation milestones.

---

# 2. Technology stack

## Application

* Next.js;
* App Router;
* TypeScript;
* Tailwind CSS.

## Validation

* Zod.

## Database

Development:

```text
SQLite
```

Production:

```text
Turso / libSQL
```

## ORM

* Prisma ORM.

## Hosting

* Vercel.

## Testing

* Vitest;
* Playwright.

---

# 3. Architecture

Use a single Next.js application.

```text
Browser
   │
   ▼
Next.js
   │
   ├── Public pages
   ├── Admin pages
   ├── Server Actions
   └── Route Handlers
          │
          ▼
     Application services
          │
          ▼
        Prisma
          │
          ▼
    SQLite / libSQL
```

No separate API/backend project is required.

---

# 4. Architectural principles

The application should optimize for:

* simplicity;
* maintainability;
* security;
* low operational complexity;
* strong mobile experience;
* fast iteration.

Avoid introducing infrastructure that is not required by the product.

Do not introduce:

* microservices;
* Redis;
* Kafka;
* queues;
* event buses;
* GraphQL;
* CQRS;
* Kubernetes;
* separate backend applications;
* complex global state management.

---

# 5. Runtime strategy

Prefer Node.js runtime for server-side operations involving:

* Prisma;
* Turso;
* authentication;
* password hashing;
* session management;
* CSV generation.

Do not move server functionality to Edge Runtime unless there is a concrete requirement.

---

# 6. Project structure

Recommended structure:

```text
src/
├── app/
│   ├── (public)/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── invitations/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   └── page.tsx
│   │
│   ├── api/
│   │   └── admin/
│   │       └── export/
│   │           └── route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── actions/
│   ├── auth.actions.ts
│   ├── invitation.actions.ts
│   ├── guest.actions.ts
│   └── rsvp.actions.ts
│
├── components/
│   ├── ui/
│   ├── wedding/
│   ├── rsvp/
│   └── admin/
│
├── services/
│   ├── auth.service.ts
│   ├── invitation.service.ts
│   ├── guest.service.ts
│   └── rsvp.service.ts
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── session.ts
│   ├── env.ts
│   └── invitation-code.ts
│
├── schemas/
│   ├── auth.schema.ts
│   ├── invitation.schema.ts
│   ├── guest.schema.ts
│   └── rsvp.schema.ts
│
├── types/
│
└── constants/
    └── wedding.ts

prisma/
├── schema.prisma
├── migrations/
└── seed.ts

tests/
├── unit/
└── e2e/
```

This structure is a guideline.

Do not create empty abstractions merely to match the folder tree.

---

# 7. Public routes

## `/`

Main wedding landing page.

Sections:

```text
Hero
Countdown
Wedding information
Location
Map
Dress code
Photography
RSVP
Footer
```

RSVP may initially exist as a section or modal inside the home page.

A separate RSVP route is not required unless implementation quality benefits from it.

---

# 8. Admin routes

Required routes:

```text
/admin/login
/admin
/admin/invitations
/admin/invitations/new
/admin/invitations/[id]
```

Optional:

```text
/admin/guests
```

A global guest route may be introduced if it improves administration.

---

# 9. Route authorization

Public routes:

```text
/
```

do not require authentication.

Protected routes:

```text
/admin
/admin/**
/api/admin/**
```

must require an authenticated administrative session.

Middleware may provide coarse route redirects, but sensitive operations must independently validate the session server-side.

A frontend redirect is not considered authorization.

---

# 10. Domain model

Core relationship:

```text
Invitation
    │
    └── Guest[]
```

Administrative relationship:

```text
AdminUser
    │
    └── AdminSession[]
```

---

# 11. Invitation entity

An `Invitation` represents one invitation or group.

Example:

```text
Família Silva

├── João Silva
└── Maria Silva
```

Fields:

```ts
id: string
name: string
code: string

createdAt: Date
updatedAt: Date
```

One invitation may contain one or many guests.

---

# 12. Guest entity

A `Guest` represents one person.

Fields:

```ts
id: string
invitationId: string

name: string

requiresRsvp: boolean
status: RSVPStatus

phone?: string
dietaryRestriction?: string
notes?: string
message?: string

respondedAt?: Date

createdAt: Date
updatedAt: Date
```

---

# 13. RSVP status

Supported states:

```ts
enum RSVPStatus {
  PENDING
  CONFIRMED
  DECLINED
}
```

UI labels:

```text
PENDING   → Aguardando resposta
CONFIRMED → Confirmado
DECLINED  → Não irá
```

The RSVP status belongs to the guest, not the invitation.

---

# 14. AdminUser entity

Represents administrative credentials.

Fields:

```ts
id: string
username: string
passwordHash: string

createdAt: Date
updatedAt: Date
```

Only one administrator is required by the current product scope.

The database model may still support multiple records without implementing permissions or multiple roles.

---

# 15. AdminSession entity

Fields:

```ts
id: string
userId: string
tokenHash: string
expiresAt: Date
createdAt: Date
```

Raw session tokens must not be persisted when token hashing is practical.

---

# 16. Initial Prisma schema

```prisma
enum RSVPStatus {
  PENDING
  CONFIRMED
  DECLINED
}

model Invitation {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique

  guests    Guest[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Guest {
  id                   String     @id @default(cuid())
  invitationId         String
  name                 String
  requiresRsvp         Boolean    @default(true)
  status               RSVPStatus @default(PENDING)

  phone                String?
  dietaryRestriction   String?
  notes                String?
  message              String?

  respondedAt          DateTime?

  invitation Invitation @relation(
    fields: [invitationId],
    references: [id],
    onDelete: Cascade
  )

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([invitationId])
  @@index([status])
}

model AdminUser {
  id           String @id @default(cuid())
  username     String @unique
  passwordHash String

  sessions AdminSession[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AdminSession {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  expiresAt DateTime

  userId String

  user AdminUser @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

---

# 17. Prisma datasource

Use SQLite as the datasource provider.

```prisma
datasource db {
  provider = "sqlite"
}
```

Development uses a local SQLite database.

Production uses libSQL/Turso through the Prisma adapter supported by the installed Prisma version.

---

# 18. Local database

Local development may use:

```text
file:./dev.db
```

Local SQLite database files must not be committed.

Recommended `.gitignore` entries:

```text
*.db
*.db-journal
```

---

# 19. Production database

Production database:

```text
Turso / libSQL
```

Required environment variables:

```text
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
```

Do not store a production SQLite file inside the Vercel filesystem.

---

# 20. Prisma + libSQL connection

The exact API must follow the pinned Prisma version.

Conceptually:

```ts
import { PrismaClient } from "@/generated/prisma";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = new PrismaClient({
  adapter,
});
```

The database client should be centralized in `src/lib/db.ts`.

---

# 21. Prisma singleton behavior

In development, avoid creating excessive Prisma clients during hot reload.

`db.ts` should implement an appropriate development singleton if required by the Prisma version being used.

Do not expose the Prisma client to browser code.

---

# 22. Production migrations

Local schema changes may use normal Prisma SQLite migrations.

Remote Turso schema changes must be handled explicitly.

Conceptual flow:

```text
Change schema.prisma
        ↓
Create/review local migration
        ↓
Test locally
        ↓
Generate/review SQL required for production
        ↓
Apply approved schema change to Turso
        ↓
Deploy application
```

Do not assume remote Turso migrations are identical to traditional Prisma-managed database deployment.

Never perform destructive production migrations without reviewing existing data.

---

# 23. Environment variables

Expected configuration:

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

SESSION_SECRET=

ADMIN_INITIAL_USERNAME=
ADMIN_INITIAL_PASSWORD=

NEXT_PUBLIC_SITE_URL=

WEDDING_DATE=2026-12-10T00:00:00-03:00
RSVP_DEADLINE=
```

---

# 24. Environment variable rules

Only values intentionally exposed to browser code may use:

```text
NEXT_PUBLIC_
```

Never expose:

* Turso auth token;
* session secrets;
* admin passwords;
* password hashes;
* private server configuration.

---

# 25. Environment validation

Validate server environment variables with Zod.

Example:

```ts
const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
});
```

Development-specific configuration may be handled separately if local SQLite does not require Turso credentials.

---

# 26. Wedding constants

Non-sensitive wedding information may be centralized in:

```text
src/constants/wedding.ts
```

Example:

```ts
export const wedding = {
  couple: {
    groom: "Ryelthon",
    bride: "Thayna",
  },

  date: "...",

  venue: {
    name: "",
    address: "",
    mapUrl: "",
  },

  dressCode: "",
};
```

Final data is still pending.

---

# 27. Invitation code requirements

Invitation codes must be:

* unique;
* random;
* non-sequential;
* reasonably easy to type;
* difficult to guess;
* case-insensitive during lookup.

Do not expose internal IDs as invitation codes.

---

# 28. Invitation code alphabet

Recommended alphabet:

```text
ABCDEFGHJKLMNPQRSTUVWXYZ23456789
```

Avoid ambiguous characters:

```text
0
O
1
I
```

Suggested length:

```text
6–8 characters
```

Example:

```text
7KPX4M
```

---

# 29. Invitation code generation

Use cryptographically secure randomness.

Do not use:

```ts
Math.random()
```

for invitation code generation.

Concept:

```ts
function generateInvitationCode(length = 6) {
  // secure random generation
}
```

After generation:

```text
Generate code
    ↓
Check uniqueness
    ↓
Collision?
 ┌────┴────┐
 Yes       No
 ↓          ↓
Retry      Save
```

The database unique constraint remains the final integrity boundary.

---

# 30. Invitation code normalization

Normalize public code input before lookup.

Recommended:

```text
trim
uppercase
```

Example:

```text
" 7kpx4m "
```

becomes:

```text
7KPX4M
```

Do not perform fuzzy matching.

---

# 31. RSVP lookup flow

Input:

```ts
{
  code: string
}
```

Server flow:

```text
Validate
   ↓
Normalize code
   ↓
Search invitation
   ↓
Found?
 ┌──────┴──────┐
 No            Yes
 ↓              ↓
Generic      Return only
error        invitation data
```

Invalid codes must not reveal whether a particular guest exists.

---

# 32. Public invitation response

Return only data required by the public RSVP interface.

Conceptually:

```ts
type PublicInvitation = {
  name: string;

  guests: Array<{
    id: string;
    name: string;
    requiresRsvp: boolean;
    status: RSVPStatus;

    phone?: string;
    dietaryRestriction?: string;
    notes?: string;
    message?: string;
  }>;
};
```

Avoid returning:

* admin information;
* unrelated invitation data;
* database metadata;
* session data.

---

# 33. RSVP submission payload

Concept:

```ts
{
  code: string,

  guests: [
    {
      guestId: string,
      status: "CONFIRMED",
      phone?: string,
      dietaryRestriction?: string,
      notes?: string,
      message?: string
    }
  ]
}
```

---

# 34. RSVP submission validation

Server must perform:

```text
Validate payload
      ↓
Validate RSVP deadline
      ↓
Normalize invitation code
      ↓
Load invitation
      ↓
Load invitation guests
      ↓
Verify submitted guests belong to invitation
      ↓
Verify guests require RSVP
      ↓
Persist responses
      ↓
Update respondedAt
      ↓
Return success
```

Do not trust guest IDs received from the client.

---

# 35. RSVP authorization model

The invitation code acts as limited access to the RSVP information for that invitation.

It is not an authenticated user account.

Possession of a code only allows access to:

* the related invitation;
* its guests;
* their RSVP data.

It must never grant access to administrative functionality.

---

# 36. RSVP updates

Guests may reopen their invitation using the same code before the deadline.

Existing values should be preloaded.

A new valid response replaces the current response.

No audit/history table is required for the MVP.

---

# 37. RSVP deadline

The deadline must be server-authoritative.

Never rely only on:

* disabled frontend button;
* hidden form;
* browser clock.

Timezone:

```text
America/Fortaleza
```

Dates should be stored/compared in a consistent, timezone-aware manner.

---

# 38. RSVP deadline behavior

Before deadline:

* new response allowed;
* edits allowed.

After deadline:

* new responses blocked;
* edits blocked;
* invitation lookup may still display an informative closed-state message.

---

# 39. Non-RSVP guests

Guests such as children may use:

```ts
requiresRsvp = false
```

These guests:

* should appear on the invitation when appropriate;
* should not require a response;
* should not count as `PENDING`.

---

# 40. Dashboard metrics

Required metrics:

```text
Total RSVP-eligible guests
Confirmed
Declined
Pending
```

Definitions:

```text
eligible =
requiresRsvp == true

confirmed =
eligible && status == CONFIRMED

declined =
eligible && status == DECLINED

pending =
eligible && status == PENDING
```

Invariant:

```text
totalEligible =
confirmed + declined + pending
```

This should be covered by unit tests.

---

# 41. Invitation creation

Admin form receives:

```text
Invitation name

Guests
├── Guest 1
├── Guest 2
└── ...
```

Server flow:

```text
Require admin
     ↓
Validate payload
     ↓
Generate unique code
     ↓
Create Invitation
     ↓
Create Guests
     ↓
Return result
```

Invitation and initial guests should preferably be created atomically.

---

# 42. Invitation editing

Admin may edit:

* invitation name;
* guest names;
* guest metadata;
* guest list.

Normal editing must not regenerate the invitation code.

---

# 43. Adding guests

Admin may add additional guests to an existing invitation.

New guests default to:

```text
requiresRsvp = true
status = PENDING
```

unless explicitly configured otherwise.

---

# 44. Guest deletion

Guest deletion requires confirmation.

If:

```text
status != PENDING
```

or:

```text
respondedAt != null
```

display stronger confirmation because response data will be lost.

---

# 45. Invitation deletion

Deleting an invitation removes associated guests through cascade behavior.

UI must require explicit destructive confirmation.

---

# 46. Code regeneration

Priority:

```text
P1
```

If implemented:

```text
Admin requests regeneration
        ↓
Confirmation dialog
        ↓
Generate new code
        ↓
Persist
        ↓
Old code immediately invalid
```

No redirect or alias from old codes is required.

---

# 47. Authentication

MVP uses administrative username/password login.

Do not implement:

* guest accounts;
* OAuth;
* social login;
* role hierarchy;
* permission system.

---

# 48. Login flow

Input:

```text
username
password
```

Server:

```text
Validate
   ↓
Find AdminUser
   ↓
Verify password hash
   ↓
Valid?
 ┌────┴────┐
 No        Yes
 ↓          ↓
Generic   Create
error     session
            ↓
          Cookie
```

Use generic invalid-credential messaging.

---

# 49. Password storage

Passwords must be hashed.

Preferred algorithms:

* Argon2;
* bcrypt.

Do not use:

* plaintext;
* MD5;
* reversible encryption;
* custom cryptography.

---

# 50. Sessions

Generate a high-entropy random session token.

Browser stores:

```text
raw token
```

Database stores:

```text
hash(raw token)
```

Concept:

```text
random token
  ├── cookie → browser
  └── SHA-256 → database
```

---

# 51. Session validation

Request:

```text
session cookie
    ↓
hash token
    ↓
query AdminSession
    ↓
session exists?
    ↓
not expired?
    ↓
return admin
```

Expired sessions must be rejected.

---

# 52. Session cookie

Recommended properties:

```ts
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
}
```

Suggested lifetime:

```text
7 days
```

unless changed later.

---

# 53. Admin guard

Create reusable server-side authorization logic conceptually:

```ts
requireAdmin()
```

All administrative Server Actions and protected Route Handlers must call it.

Do not duplicate authorization logic unnecessarily.

---

# 54. Logout

Logout flow:

```text
Read session
    ↓
Delete session record
    ↓
Clear cookie
    ↓
Redirect /admin/login
```

Logout must invalidate server-side access.

---

# 55. Admin dashboard

Initial dashboard:

```text
Total convidados
Confirmados
Não irão
Aguardando
```

Optional:

```text
Recent responses
```

Avoid overbuilding analytics.

---

# 56. Invitation list

Recommended columns:

```text
Invitation
Code
Guests
Confirmed
Declined
Pending
Actions
```

Actions:

```text
View
Edit
Copy code
Delete
```

---

# 57. Global guest list

If implemented:

Columns:

```text
Guest
Invitation
Status
Phone
Response date
```

Search fields:

```text
guest name
invitation name
invitation code
```

Filters:

```text
All
Confirmed
Declined
Pending
```

---

# 58. Search

Expected guest count is relatively small.

Prisma/database filtering is sufficient.

Do not introduce external search services.

---

# 59. Pagination

Pagination is not required for the initial version unless the real guest list makes it necessary.

If introduced, use simple server-side pagination.

Do not use infinite scroll for admin tables.

---

# 60. CSV export

Recommended endpoint:

```text
GET /api/admin/export
```

Flow:

```text
Request
  ↓
requireAdmin()
  ↓
Query guests
  ↓
Serialize CSV
  ↓
Return attachment
```

---

# 61. CSV encoding

Use UTF-8.

Consider UTF-8 BOM when needed for correct Portuguese character handling in Microsoft Excel.

Recommended filename:

```text
convidados-ryelthon-thayna-YYYY-MM-DD.csv
```

---

# 62. CSV fields

Recommended:

```text
Nome
Convite
Código
Status
Telefone
Restrição alimentar
Observações
Mensagem
Respondido em
```

Status labels:

```text
PENDING → Aguardando
CONFIRMED → Confirmado
DECLINED → Não irá
```

---

# 63. Validation schemas

Use Zod schemas such as:

```text
loginSchema
invitationCodeSchema
createInvitationSchema
updateInvitationSchema
createGuestSchema
updateGuestSchema
submitRsvpSchema
```

Validation belongs at trust boundaries.

---

# 64. Server Actions

Preferred for mutations:

```text
login
logout

createInvitation
updateInvitation
deleteInvitation

createGuest
updateGuest
deleteGuest

submitRsvp
```

Reading data may remain directly server-side where appropriate.

---

# 65. Route Handlers

Use Route Handlers when HTTP semantics are useful.

Example:

```text
/api/admin/export
```

Do not create REST endpoints for every internal operation merely out of habit.

---

# 66. Service layer

Services should contain reusable business logic.

Examples:

```text
auth.service.ts
invitation.service.ts
guest.service.ts
rsvp.service.ts
```

A service layer is useful when logic is reused or non-trivial.

Do not turn every single Prisma call into a needless service abstraction.

---

# 67. Public components

Potential components:

```text
WeddingHero
Countdown
WeddingDetails
VenueSection
DressCodeSection
PhotoSection
RsvpSection
RsvpCodeForm
RsvpGuestForm
RsvpResult
WeddingFooter
```

Avoid excessive component fragmentation.

---

# 68. Admin components

Potential components:

```text
AdminHeader
AdminNavigation
StatsCard
InvitationTable
GuestTable
StatusBadge
InvitationForm
GuestForm
DeleteDialog
CopyCodeButton
```

---

# 69. Public design direction

Must feel:

* elegant;
* sophisticated;
* editorial;
* premium;
* romantic;
* minimal.

Prioritize:

* whitespace;
* strong typography;
* photography;
* visual hierarchy;
* restrained decorative elements.

Avoid generic SaaS aesthetics.

---

# 70. Typography

Preferred direction:

* serif display font for major headings;
* clean sans-serif font for body and functional content.

Use `next/font` when appropriate.

Avoid loading unnecessary font weights.

Final fonts depend on the wedding's identity.

---

# 71. Images

Use:

```text
next/image
```

Ensure:

* meaningful dimensions;
* responsive sizing;
* compressed images;
* no avoidable CLS.

---

# 72. Countdown

Countdown requires client-side updates.

It may therefore be a Client Component.

It receives the canonical wedding datetime.

Display:

```text
Days
Hours
Minutes
Seconds
```

When remaining time <= 0, render an event-state message instead of negative numbers.

---

# 73. Maps

Do not add a complex Maps SDK for the MVP.

Preferred solution:

* simple map embed when needed;
* link to Google Maps or equivalent.

Avoid unnecessary billing/API-key dependencies.

---

# 74. Motion

Animations should be subtle.

Allowed examples:

* fade;
* reveal;
* slight vertical movement;
* hover transitions.

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Do not hide important information behind animation.

---

# 75. Accessibility

Verify:

* semantic HTML;
* labels;
* form associations;
* keyboard navigation;
* visible focus;
* sufficient contrast;
* alt text;
* accessible errors;
* modal/dialog keyboard behavior.

---

# 76. SEO

Public metadata:

```text
Ryelthon & Thayna
10 de dezembro de 2026
```

Configure:

* title;
* description;
* favicon;
* Open Graph metadata;
* social preview image.

Admin pages must not be indexed.

---

# 77. Error handling

Never expose:

* Prisma error messages;
* stack traces;
* SQL;
* environment variables;
* tokens;
* passwords;
* internal paths.

Public errors should be understandable and generic where security requires it.

---

# 78. UI states

Forms and asynchronous features should account for relevant:

```text
idle
loading
success
error
empty
```

Examples:

```text
Confirmando presença...
Salvando convite...
Código inválido.
Nenhum convite cadastrado.
```

---

# 79. Security headers

Consider sensible headers such as:

* `X-Content-Type-Options`;
* `Referrer-Policy`;
* frame protections;
* Content Security Policy if practical.

Do not introduce an untested CSP that breaks the application.

---

# 80. Rate limiting

Priority:

```text
P1
```

Most relevant targets:

* admin login;
* invitation-code lookup.

Do not block MVP implementation on distributed rate limiting unless abuse becomes a real concern.

---

# 81. Logging

Server logging may include:

* operation name;
* timestamp;
* high-level error category.

Do not log:

* passwords;
* raw session tokens;
* Turso auth tokens;
* complete private messages unnecessarily.

---

# 82. Unit testing

Use Vitest.

Priority areas:

## Invitation codes

Test:

* generated length;
* allowed alphabet;
* normalization.

## Dashboard

Test:

* all statuses;
* non-RSVP guest behavior;
* total invariant.

## RSVP deadline

Test:

* before deadline;
* after deadline;
* boundary conditions.

## Validation

Test malformed payloads and invalid enum values.

---

# 83. Integration tests

Useful scenarios:

```text
valid invitation lookup
invalid invitation lookup
guest cannot be submitted under another invitation
expired RSVP cannot mutate
unauthenticated admin mutation rejected
```

---

# 84. Playwright E2E

Critical scenarios:

## E2E-01

Admin successfully logs in.

## E2E-02

Unauthenticated visitor cannot access admin.

## E2E-03

Admin creates invitation with multiple guests.

## E2E-04

Public visitor loads invitation using correct code.

## E2E-05

Invalid invitation code fails safely.

## E2E-06

Two members of the same invitation submit different statuses.

## E2E-07

Existing RSVP is later edited.

## E2E-08

Dashboard reflects current responses.

## E2E-09

CSV export requires authentication.

---

# 85. Critical application flow

This flow must always remain functional:

```text
Admin login
     ↓
Create invitation
     ↓
Add João + Maria
     ↓
Generate code
     ↓
Public visitor enters code
     ↓
João confirms
Maria declines
     ↓
Persist response
     ↓
Dashboard:
1 confirmed
1 declined
```

Breaking this flow is a critical regression.

---

# 86. Seed strategy

`prisma/seed.ts` may create:

* development admin;
* development invitation;
* development guests.

Example:

```text
Invitation:
Família Teste

Guests:
João Teste
Maria Teste
```

Fake guests must never be automatically inserted into production.

---

# 87. Admin bootstrap

Environment variables:

```text
ADMIN_INITIAL_USERNAME
ADMIN_INITIAL_PASSWORD
```

may be used to seed/bootstrap the first administrator.

The password must be hashed before persistence.

The application must authenticate against the stored AdminUser afterward, not continuously against plaintext environment credentials.

---

# 88. `.env.example`

Commit:

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

SESSION_SECRET=

ADMIN_INITIAL_USERNAME=
ADMIN_INITIAL_PASSWORD=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

WEDDING_DATE=2026-12-10T00:00:00-03:00
RSVP_DEADLINE=
```

Do not commit actual secrets.

---

# 89. Package scripts

Expected scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "...",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

The exact lint configuration may follow the created Next.js project.

---

# 90. Quality gate

Before production deploy, require at minimum:

```text
typecheck
unit tests
build
```

Once E2E is stable, also require the critical Playwright tests.

---

# 91. Vercel configuration

Configure production environment variables inside Vercel.

Required:

```text
TURSO_DATABASE_URL
TURSO_AUTH_TOKEN
SESSION_SECRET
NEXT_PUBLIC_SITE_URL
WEDDING_DATE
RSVP_DEADLINE
```

Potential bootstrap variables may be removed or rotated once the production admin has been safely created.

---

# 92. Production bootstrap

Recommended flow:

```text
Create Turso database
       ↓
Configure production secrets
       ↓
Apply schema
       ↓
Create AdminUser
       ↓
Deploy Vercel
       ↓
Run smoke tests
```

---

# 93. Backup and recovery

Guest confirmations are real production data.

Before accepting real RSVPs:

* understand Turso backup/recovery capabilities;
* ensure production database can be recovered;
* avoid destructive schema changes without a recoverable state.

---

# 94. Milestone M1 — Foundation

Implement:

* Next.js project;
* TypeScript;
* Tailwind;
* folder structure;
* Prisma;
* SQLite development DB;
* Turso/libSQL adapter;
* Zod;
* environment validation;
* schema;
* seed;
* Vitest;
* Playwright base configuration.

Acceptance:

```text
npm run dev works
database access works
seed works
typecheck works
tests work
build works
```

Do not implement public wedding UI or RSVP logic in this milestone.

---

# 95. Milestone M2 — Public website

Implement:

* public page structure;
* Hero;
* countdown;
* event details;
* venue;
* dress code;
* image placeholders;
* responsive layout;
* metadata.

Acceptance:

* complete information architecture;
* responsive mobile layout;
* working countdown.

---

# 96. Milestone M3 — RSVP Engine

Implement:

* invitation code generation;
* invitation code lookup;
* RSVP UI;
* grouped invitations;
* individual statuses;
* optional fields;
* edits;
* deadline;
* validation;
* persistence;
* error states.

Acceptance:

```text
code
→ invitation
→ individual responses
→ database
```

works end-to-end.

---

# 97. Milestone M4 — Admin Authentication

Implement:

* AdminUser;
* AdminSession;
* password hashing;
* login;
* session cookie;
* authorization;
* logout.

Acceptance:

* unauthenticated admin blocked;
* correct credentials work;
* logout invalidates session.

---

# 98. Milestone M5 — Admin Management

Implement:

* dashboard;
* invitation list;
* create invitation;
* edit invitation;
* delete invitation;
* guest CRUD;
* search;
* filters;
* code copy.

Acceptance:

The couple can manage the complete invitation list without database access.

---

# 99. Milestone M6 — Export and tests

Implement:

* CSV export;
* unit tests;
* integration tests where valuable;
* critical Playwright flows;
* error handling review.

---

# 100. Milestone M7 — Visual polish

Apply final:

* wedding palette;
* typography;
* photographs;
* decorative identity;
* animations;
* responsive refinements;
* social preview.

---

# 101. Milestone M8 — Production

Perform:

* production Turso configuration;
* production schema setup;
* admin bootstrap;
* Vercel environment setup;
* production build;
* smoke testing;
* real-device RSVP test;
* CSV verification;
* recovery/backup check.

---

# 102. Recommended Codex execution strategy

Do not ask Codex to build all milestones in one pass.

Recommended:

```text
M1
↓
review

M2
↓
review

M3
↓
review

M4
↓
review

M5
↓
review

M6
↓
review

M7
↓
review

M8
```

Each milestone should leave the repository buildable.

---

# 103. First Codex instruction

Recommended first task:

```text
Read AGENTS.md, docs/PRD.md, docs/TECHNICAL_SPEC.md and
.agents/skills/wedding-site-ryelthon-thayna/SKILL.md.

Implement only Milestone M1 — Foundation.

Do not implement the public wedding UI, RSVP, or admin features yet.

Before editing, inspect the repository and identify the existing state.

Follow the documented stack and architecture.

Keep the implementation simple and production-oriented.

At completion:

1. run typecheck;
2. run relevant tests;
3. run production build;
4. summarize created and modified files;
5. report deviations from TECHNICAL_SPEC.md;
6. report unresolved technical decisions;
7. do not proceed to M2 automatically.
```

---

# 104. Core engineering principle

This is a small production application containing real guest information.

Optimize for:

```text
simple
secure
maintainable
testable
responsive
visually polished
```

Do not optimize for architectural sophistication.
