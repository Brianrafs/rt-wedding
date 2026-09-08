# UI_SPEC.md

## Ryelthon & Thayna Wedding Website

Version: 1.1

Wedding date: **10/12/2026**

---

# 1. Visual Direction

The public wedding website should communicate:

* elegance;
* romance;
* softness;
* sophistication;
* editorial composition;
* premium wedding identity.

The visual experience must feel intentional and custom-made for the couple.

Avoid a generic wedding template appearance.

The overall style should lean toward:

```text
Elegant Wedding Editorial
+
Soft Romantic Details
+
Minimal Layout
+
Lilac Identity
```

---

# 2. Brand Personality

The interface should feel:

* refined;
* delicate;
* graceful;
* warm;
* timeless;
* romantic without becoming childish;
* decorative without becoming visually heavy.

The experience should feel closer to a premium wedding editorial than a conventional event website.

---

# 3. Typography

## Primary Display Font

Use:

```text
Bridal
```

Primary usage:

* names of the couple;
* major section titles;
* decorative headings;
* hero emphasis;
* large visual moments.

Do not use Bridal for:

* long paragraphs;
* form labels;
* admin tables;
* buttons;
* small text.

It should remain a visual accent.

---

# 4. Decorative Font

Use:

```text
Boheme Floral
```

Usage should be restrained.

Potential usage:

* decorative initials;
* small wedding accents;
* ornamental labels;
* visual flourishes;
* highlighted decorative words.

Do not use the decorative font for long text.

Do not combine Bridal and Boheme Floral excessively in the same visual block.

---

# 5. Supporting Font

A clean secondary font must be used for functional content.

Recommended direction:

```text
Bridal → Display
Boheme Floral → Decoration
Manrope or DM Sans → Functional UI
```

The supporting font should prioritize:

* readability;
* mobile clarity;
* clean form labels;
* clear button text;
* good contrast with the decorative fonts.

Final preferred options:

```text
1. Manrope
2. DM Sans
```

---

# 6. Typography Hierarchy

## Hero Couple Names

Very large.

Example:

```text
Ryelthon
&
Thayna
```

Use Bridal.

This should be the strongest visual element of the first viewport.

---

## Section Titles

Examples:

```text
Nosso Dia
Local
Traje
Confirme sua Presença
```

Use Bridal.

Keep generous whitespace around headings.

---

## Decorative Captions

Examples:

```text
10 · 12 · 2026
Para sempre começa aqui
Com amor
```

May use Boheme Floral selectively.

---

## Body Text

Use supporting font.

Prioritize:

* readable line-height;
* moderate line width;
* clean hierarchy;
* high contrast.

---

## Functional UI

Use supporting font for:

* buttons;
* inputs;
* errors;
* RSVP options;
* admin UI;
* tables;
* filters.

---

# 7. Confirmed Color Identity

The wedding visual identity is based primarily on lilac tones.

Confirmed colors:

```text
Primary Lilac
#C6A5F2
```

```text
Soft Lilac / Off-white
#F4E6F5
```

These should guide the entire visual system.

---

# 8. Primary Lilac

```text
#C6A5F2
```

Usage:

* primary calls to action;
* interactive highlights;
* selected RSVP states;
* decorative accents;
* links;
* visual flourishes;
* subtle emphasis.

Do not use the primary lilac as the background of every section.

---

# 9. Soft Lilac / Off-white

```text
#F4E6F5
```

Usage:

* soft section backgrounds;
* RSVP section;
* dress code section;
* decorative surfaces;
* subtle content separation.

This color should create a romantic atmosphere without making the page visually heavy.

---

# 10. Supporting Palette

## Deep Lilac

```text
#8E6DB8
```

Usage:

* hover states;
* selected controls;
* stronger accents;
* footer;
* occasional headings;
* active elements.

---

## Warm White

```text
#FCFAFD
```

Usage:

* primary page background;
* form surfaces;
* image areas;
* content sections.

Prefer this over pure white where possible.

---

## Main Text

```text
#2F2933
```

Usage:

* body text;
* labels;
* navigation;
* dark headings;
* buttons on light lilac.

Avoid pure black where possible.

---

## Muted Text

```text
#746C78
```

Usage:

* descriptions;
* helper text;
* captions;
* optional field labels.

---

## Border

```text
#E3D6E8
```

Usage:

* inputs;
* subtle dividers;
* decorative borders;
* admin surfaces.

---

# 11. Semantic Color Tokens

Use semantic variables.

Recommended:

```css
:root {
  --background: #fcfafd;
  --foreground: #2f2933;

  --primary: #c6a5f2;
  --primary-hover: #8e6db8;
  --primary-foreground: #2f2933;

  --soft-lilac: #f4e6f5;

  --muted-foreground: #746c78;

  --border: #e3d6e8;
}
```

Do not scatter arbitrary lilac hex values throughout components.

---

# 12. Color Usage Rules

Use color strategically.

Prefer:

```text
Whitespace + Typography + Photography
```

over:

```text
Large blocks of lilac everywhere
```

The palette should support the content, not dominate it.

---

# 13. Public Page Color Rhythm

Recommended progression:

```text
Hero
Photography / Warm White

↓

Introduction
#FCFAFD

↓

Wedding Information
#F4E6F5

↓

Photography
#FCFAFD

↓

Venue
#FCFAFD

↓

Dress Code
#F4E6F5

↓

RSVP
#F4E6F5

↓

Footer
#8E6DB8
```

Avoid alternating backgrounds mechanically.

Use changes in background only when they improve visual rhythm.

---

# 14. Layout

Public site should use generous whitespace.

Desktop max content width:

```text
~1200px
```

Text-heavy sections:

```text
~700px
```

Mobile horizontal padding:

```text
16–24px
```

Desktop horizontal padding:

```text
48–80px
```

Section vertical spacing:

```text
Mobile:
80–112px

Desktop:
120–180px
```

Avoid tight vertical spacing.

---

# 15. Hero

The Hero is the most important visual area.

It should immediately communicate:

```text
Ryelthon & Thayna
10 · 12 · 2026
```

Potential composition:

```text
Full viewport photography

          10 · 12 · 2026

       Ryelthon
           &
         Thayna
```

Alternative:

```text
Editorial split layout

Photo                 Names
                      Date
                      Short phrase
```

Final composition depends on the supplied photography.

---

# 16. Hero Requirements

Hero should:

* occupy most or all of the initial viewport;
* emphasize couple names;
* include wedding date;
* work strongly on mobile;
* preserve text readability;
* avoid excessive controls;
* feel editorial rather than app-like.

Optional CTA:

```text
Confirme sua presença
```

or:

```text
Conheça nosso dia
```

---

# 17. Photography

Photography should be treated as editorial content.

Prefer:

* large images;
* portrait photography;
* full-bleed moments;
* asymmetrical compositions;
* intentional crops.

Avoid:

* thumbnail grids;
* generic card galleries;
* repetitive rectangles.

---

# 18. Image Treatment

Recommended formats:

* portrait 4:5;
* square;
* wide cinematic;
* occasional full-width photo.

Rounded corners should be subtle or absent depending on the final wedding identity.

Avoid excessive card styling.

---

# 19. Decorative Floral Elements

Because Boheme Floral is part of the identity, decorative floral elements may appear as accents.

Potential usage:

* behind a section title;
* corner ornament;
* divider;
* hero detail;
* footer decoration.

Use sparingly.

Do not place floral decoration in every section.

---

# 20. Intro / Wedding Message

Potential layout:

```text
Estamos felizes em compartilhar
este momento tão especial com você.
```

Use:

* centered or editorial alignment;
* generous whitespace;
* optional floral accent;
* subtle lilac typography.

---

# 21. Countdown Section

The countdown should feel integrated into the wedding identity.

Recommended:

```text
Nosso grande dia começa em

  93       07       15       22
dias     horas    minutos   segundos
```

Avoid generic SaaS metric cards.

Prefer typography-driven presentation.

---

# 22. Countdown Mobile

On small screens:

```text
93     07
dias   horas

15     22
min    seg
```

or a readable four-column version.

No horizontal overflow.

---

# 23. Wedding Details Section

Display:

* wedding date;
* time;
* venue.

Potential layout:

```text
10
DEZ
2026

Quinta-feira
18h

Nome do Local
João Pessoa — PB
```

Exact details remain pending.

---

# 24. Venue Section

Should contain:

* venue name;
* address;
* location action;
* optional map preview.

CTA:

```text
Como chegar
```

or:

```text
Ver localização
```

Do not allow a map embed to visually dominate the wedding identity.

---

# 25. Dress Code Section

Should be visually light and elegant.

Potential structure:

```text
Traje

Esporte fino

Queremos que você se sinta
elegante e confortável para
celebrar esse dia conosco.
```

Optional references may be added later.

---

# 26. RSVP Section

RSVP is the primary functional area of the public site.

It must remain visually aligned with the wedding identity while being extremely clear.

Section title:

```text
Confirme sua Presença
```

Supporting text:

```text
Digite o código recebido no seu convite.
```

Recommended background:

```text
#F4E6F5
```

---

# 27. RSVP Code Input

Recommended appearance:

```text
Código do convite

[ 7 K P X 4 M        ]

[ Confirmar convite ]
```

Input should:

* be large;
* work well on mobile;
* clearly show focus;
* support uppercase;
* clearly show errors;
* have comfortable tap targets.

Suggested minimum height:

```text
48px
```

---

# 28. RSVP Primary Button

Default:

```text
Background: #C6A5F2
Text: #2F2933
```

Hover:

```text
Background: #8E6DB8
Text: #FCFAFD
```

Do not automatically use white text on `#C6A5F2`.

The primary lilac is light enough that dark text is generally more appropriate.

---

# 29. RSVP Loading State

Example:

```text
Buscando seu convite...
```

Keep loading feedback subtle.

Avoid full-page blocking loaders.

---

# 30. RSVP Invalid State

Example:

```text
Não encontramos um convite com esse código.

Verifique o código recebido e tente novamente.
```

Action:

```text
Tentar novamente
```

Error styling should remain calm and elegant.

Do not make invalid invitation codes visually aggressive.

---

# 31. RSVP Invitation Result

Example:

```text
Família Silva

Quem poderá estar conosco?
```

Guests:

```text
João Silva

○ Confirmarei presença
○ Não poderei comparecer
```

Use spacing and subtle dividers rather than excessive card containers.

---

# 32. RSVP Selected State

Selected state must be obvious.

Recommended confirmed state:

```text
Background: #F4E6F5
Border: #8E6DB8
Accent: #C6A5F2
Text: #2F2933
```

Use:

* border;
* icon;
* label;
* color.

Do not rely on color alone.

---

# 33. RSVP Decline State

Declining attendance is not an error.

Use neutral or soft styling.

Avoid strong red visual treatment.

Example:

```text
Não poderei comparecer
```

should feel calm and respectful.

---

# 34. Optional RSVP Fields

Potential fields:

```text
Telefone
Restrição alimentar
Observações
Mensagem aos noivos
```

Use a single-column layout on mobile.

Optional fields should be marked appropriately.

Example:

```text
Mensagem aos noivos
Opcional
```

---

# 35. RSVP Submit

Primary CTA:

```text
Confirmar resposta
```

States:

```text
idle
loading
success
error
disabled
```

Loading label:

```text
Salvando...
```

---

# 36. RSVP Success

Success should feel emotional rather than transactional.

Example:

```text
Presença confirmada

Estamos muito felizes em saber
que você estará conosco nesse dia tão especial.
```

Optional floral or lilac decorative accent.

Avoid:

```text
Success!
```

---

# 37. RSVP Decline Result

Example:

```text
Obrigada por nos avisar.

Sentiremos sua falta,
mas ficamos felizes por você fazer parte da nossa história.
```

Tone should remain warm.

---

# 38. RSVP Closed State

Example:

```text
As confirmações foram encerradas.

Se precisar falar com os noivos,
entre em contato diretamente.
```

Do not display disabled forms without explanation.

---

# 39. Footer

Footer should be visually distinctive.

Recommended background:

```text
#8E6DB8
```

Text:

```text
#FCFAFD
```

Potential content:

```text
Ryelthon & Thayna

10 · 12 · 2026

Com amor
```

Decorative Boheme Floral elements may be used.

---

# 40. Header / Navigation

A persistent navigation is optional.

Because this is a one-page wedding experience, avoid a heavy navbar.

Potential desktop nav:

```text
Nosso Dia
Local
Traje
RSVP
```

Mobile may use:

* simple menu;
* minimal header;
* or no navigation if scrolling flow remains clear.

---

# 41. Buttons

## Primary

```text
Background: #C6A5F2
Text: #2F2933
```

Use for:

* RSVP;
* create invitation;
* main actions.

## Primary Hover

```text
Background: #8E6DB8
Text: #FCFAFD
```

## Secondary

Transparent or light background with lilac border.

Use for:

* map;
* cancel;
* secondary actions.

## Destructive

Admin-only.

Use clearly destructive styling independent of wedding palette.

---

# 42. Button Shape

Recommended radius:

```text
8–14px
```

Avoid pill-shaped buttons everywhere unless later required by the visual identity.

---

# 43. Inputs

Style:

* clear border;
* warm white or very light background;
* subtle radius;
* strong focus state;
* comfortable height.

Recommended:

```text
height: 44–48px
```

Border:

```text
#E3D6E8
```

Focus:

```text
#8E6DB8
```

---

# 44. Borders

Use thin and subtle borders.

Recommended:

```text
1px
```

Avoid strong black borders on the public website.

---

# 45. Shadows

Use sparingly.

Prefer depth through:

* spacing;
* contrast;
* background;
* photography.

Avoid generic card shadows.

---

# 46. Radius System

Suggested:

```text
Small: 6px
Medium: 12px
Large: 20px
```

Use consistently.

Photography may use lower radius or no radius depending on final identity.

---

# 47. Motion

Motion should feel graceful.

Recommended:

* fade;
* subtle reveal;
* slight upward movement;
* hover transitions;
* gentle image reveal.

Timing:

```text
200–700ms
```

depending on interaction.

---

# 48. Scroll Animation

Do not animate every element.

Good candidates:

* hero text;
* section titles;
* large photography;
* decorative accents.

Forms should remain visually stable.

---

# 49. Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

When enabled:

* remove unnecessary transforms;
* simplify transitions;
* display content immediately.

---

# 50. Mobile-first

The public website should be treated primarily as a mobile experience.

Mobile priorities:

* readable typography;
* clear dates and location;
* easy RSVP interaction;
* large tap targets;
* fast image loading;
* no horizontal overflow.

---

# 51. Mobile Hero

Must account for:

* portrait crops;
* different viewport heights;
* browser controls;
* text readability.

Do not hardcode positions that only work on one device.

---

# 52. Desktop Layout

Desktop can use more editorial compositions.

Prefer:

* asymmetrical sections;
* two-column layouts;
* large typography;
* larger image compositions;
* generous margins.

Do not merely stretch mobile UI.

---

# 53. Breakpoints

Use Tailwind defaults unless design needs otherwise.

Verify at:

```text
375px
430px
768px
1024px
1280px+
```

---

# 54. Admin UI Direction

Admin should be visually related to the wedding identity but prioritize usability.

Goals:

* clarity;
* speed;
* legibility;
* predictable interactions.

Avoid decorative fonts in functional areas.

---

# 55. Admin Typography

Use functional font only.

Recommended:

```text
Manrope or DM Sans
```

Do not use Bridal or Boheme Floral for:

* tables;
* metrics;
* forms;
* filter controls;
* data-heavy screens.

Wedding fonts may appear in small branding elements only.

---

# 56. Admin Layout

Desktop:

```text
Sidebar
+
Main content
```

or compact top navigation.

Mobile:

```text
Top navigation
+
Main content
```

Do not retain a large sidebar on small screens.

---

# 57. Admin Colors

Use lilac identity subtly.

Recommended:

```text
Primary Action
#C6A5F2

Active / Hover
#8E6DB8

Background
#FCFAFD

Soft Surface
#F4E6F5

Border
#E3D6E8

Text
#2F2933
```

Do not make all dashboard surfaces lilac.

---

# 58. Admin Dashboard Cards

Cards are appropriate in admin.

Metrics:

```text
Total
Confirmados
Não irão
Aguardando
```

Cards should prioritize scanability.

No decorative fonts for numbers or labels.

---

# 59. Status Badges

Statuses:

```text
Confirmado
Não irá
Aguardando
```

Each must be understandable without color alone.

Always include visible text.

---

# 60. Admin Tables

Desktop:

Use standard table layout.

Mobile:

Prefer:

* responsive rows;
* stacked cards;
* compact summaries.

Horizontal scrolling should be a fallback, not the default.

---

# 61. Empty States

Example:

```text
Nenhum convite cadastrado

Crie o primeiro convite para começar
a organizar sua lista.

[ Criar convite ]
```

Empty states should always offer a useful next action.

---

# 62. Destructive Confirmation

Example:

```text
Excluir convite?

Todos os convidados vinculados também serão removidos.

[ Cancelar ]
[ Excluir convite ]
```

Destructive actions must be visually distinct from lilac primary actions.

---

# 63. Loading States

Use:

* inline button loading;
* skeletons;
* subtle spinners.

Avoid blocking the whole screen for small actions.

---

# 64. Toasts

Admin may use toasts for:

```text
Convite criado
Código copiado
Convidado atualizado
```

Do not use disappearing toasts as the only form-validation feedback.

---

# 65. Accessibility

Minimum requirements:

* semantic headings;
* proper labels;
* keyboard navigation;
* visible focus;
* sufficient contrast;
* alt text;
* accessible dialogs;
* clear error states;
* minimum target sizes.

Decorative fonts must never compromise readability.

---

# 66. Color Accessibility

Before finalizing UI, verify contrast ratios.

Important rule:

```text
#C6A5F2 + white text
```

must not be assumed as accessible.

Prefer:

```text
#C6A5F2 + #2F2933
```

for most primary buttons and controls.

Deep lilac may support white text more effectively.

---

# 67. Content Language

Primary language:

```text
Português do Brasil
```

Public tone:

* warm;
* romantic;
* elegant;
* intimate;
* natural.

Avoid corporate language.

Admin tone:

* direct;
* functional;
* concise.

---

# 68. UI Copy Direction

Prefer:

```text
Confirme sua presença
```

instead of:

```text
Enviar RSVP
```

Prefer:

```text
Como chegar
```

instead of:

```text
Abrir endereço
```

Prefer emotional copy in public pages and functional copy in admin.

---

# 69. Iconography

Use minimal line icons.

Potential icons:

* calendar;
* clock;
* location;
* arrow;
* copy;
* search;
* edit.

Avoid decorative icon overload.

---

# 70. Design Tokens

Centralize:

```text
colors
typography
spacing
radius
shadows
motion
```

Avoid one-off arbitrary values when reusable tokens make sense.

---

# 71. Visual Consistency Rule

When uncertain between:

```text
more decoration
```

and:

```text
more whitespace
```

prefer whitespace.

When uncertain between:

```text
generic card
```

and:

```text
editorial composition
```

prefer editorial composition on the public site.

---

# 72. Confirmed Identity

Confirmed:

```text
Primary display font:
Bridal

Decorative font:
Boheme Floral

Primary lilac:
#C6A5F2

Soft lilac / off-white:
#F4E6F5
```

Supporting palette:

```text
Deep Lilac
#8E6DB8

Warm White
#FCFAFD

Main Text
#2F2933

Muted Text
#746C78

Border
#E3D6E8
```

---

# 73. Pending Visual Decisions

Still pending:

* final supporting font;
* monogram/logo;
* invitation visual references;
* floral assets;
* final photography;
* exact hero composition;
* dress code content;
* venue content;
* final RSVP copy;
* final footer copy;
* couple story section.

These should be added without requiring an architectural redesign.

---

# 74. UI Acceptance Criteria

The public UI is acceptable when:

1. it immediately communicates the couple and wedding date;
2. it does not look like a generic wedding template;
3. it works strongly on mobile;
4. RSVP is obvious and easy to complete;
5. decorative fonts do not reduce readability;
6. the lilac identity is consistent;
7. photography feels intentional;
8. forms have clear states;
9. animations remain subtle;
10. accessibility fundamentals are respected;
11. the admin remains functional and visually distinct from the public site;
12. `#C6A5F2` and `#F4E6F5` are used consistently through semantic design tokens.

---

# 75. Codex UI Rule

Before implementing final visual work, Codex must inspect:

```text
docs/UI_SPEC.md
```

and any supplied:

* invitation;
* monogram;
* logo;
* photographs;
* floral references;
* color references.

If exact design information is missing:

* build a flexible layout;
* preserve the confirmed typography and palette;
* avoid inventing an elaborate identity that could conflict with later assets.

These pending assets must not block implementation of the layout.

Use neutral placeholders and flexible composition areas.
Do not invent a permanent monogram, logo, floral system or photographic direction.

When final assets are provided, they should be integrated without requiring structural redesign.