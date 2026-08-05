---
name: Kadlec — Druhý názor (konzultace.html)
description: A Bauhaus foundation-workshop landing page where three primary colors carry three fixed jobs and nothing is decorative.
colors:
  table: "#f0f0ee"
  plane: "#ffffff"
  ink: "#141618"
  ink-2: "#4a4f54"
  rule: "#c9cbcd"
  red: "#d8261b"
  red-deep: "#b81d13"
  blue: "#1a3fd0"
  yellow: "#f5c400"
  grid: "rgba(26,63,208,.07)"
typography:
  display:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 7.4vw, 3.6rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "clamp(1.55rem, 5vw, 2.3rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1.42rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "clamp(1.06rem, 3.5vw, 1.22rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  subhead:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.08
  label:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.14em"
  figure:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
rounded:
  none: "0"
  circle: "50%"
spacing:
  u: "8px"
  u1-5: "12px"
  u2: "16px"
  u2-5: "20px"
  u3: "24px"
  u4: "32px"
  u5: "40px"
  u6: "48px"
  u8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.plane}"
    typography: "{typography.subhead}"
    rounded: "{rounded.none}"
    height: "64px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
    textColor: "{colors.plane}"
  button-primary-disabled:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.plane}"
  button-sticky:
    backgroundColor: "{colors.red}"
    textColor: "{colors.plane}"
    rounded: "{rounded.none}"
    height: "56px"
    width: "100%"
  option-row:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
    height: "62px"
    width: "100%"
  option-row-selected:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.none}"
    padding: "10px"
    height: "52px"
  chip-selected:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.ink}"
  input-text:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
    height: "56px"
    width: "100%"
  plane-surface:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.none}"
    padding: "24px"
  alert-block:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  step-marker:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.plane}"
    rounded: "{rounded.none}"
    size: "30px"
  form-square:
    backgroundColor: "{colors.blue}"
    rounded: "{rounded.none}"
    size: "14px"
  form-circle:
    backgroundColor: "{colors.red}"
    rounded: "{rounded.circle}"
    size: "14px"
---

# Design System: Kadlec — Druhý názor (konzultace.html)

## Overview

**Creative North Star: "The Foundation Workshop Table"**

This system governs exactly one surface: `konzultace.html`, the `noindex` ad landing page. It is a deliberate standalone world. `index.html`, `admin.html`, `blog.html` and `gdpr.html` still carry the older green/gold identity and are **not** subject to this document. Do not propagate these tokens onto those pages, and do not import their tokens here. When a second surface adopts this world, extend this file; until then, its scope is one page.

The page reads as a Bauhaus foundation-course worktable: a warm grey working surface with a visible ruled baseline, ink-black text, and three primary colors that are not a palette but a set of assigned jobs. A red circle means action and active state. A blue square means structure. A yellow triangle means warning. Nothing on the page is colored for mood; every mark is either a form doing a job or ink. Surfaces are white planes laid onto the table with a hairline rule, never cards with radius and shadow. Type is a single alphabet, lowercase in headings, tightly tracked, with hierarchy carried by size and weight alone.

The thesis behind the look is that independence gets proven by admission, not by seals. So the page refuses both the green/gold "trustworthy finance" funnel — no trust badges, no gold, no soft reassuring gradients — and its brutalist opposite: nothing here is ugly for effect, everything is squared because it is measured. The one genuine self-critical device in the build is the visibly unbuilt testimonial slot: hatched, dashed, labelled as waiting. The system would rather show an empty jig than a fake finished part.

**Key Characteristics:**
- Three primaries with fixed semantic roles; no fourth accent, no tint variants.
- Zero corner radius everywhere except true circles.
- One typeface (Jost), lowercase headings, no second family.
- Flat by construction: hairline rules and inset strokes instead of shadows.
- A visible 32px baseline grid drawn on the page background.
- Geometric marks (`::before` square / circle / triangle) instead of icons.

## Colors

Nine values, and eight of them are structural: a working surface, a raised plane, two weights of ink, a ruling line, and three primaries that each mean exactly one thing.

### Primary
- **Signal Red** (`{colors.red}`): the only color that means *press this* or *this is chosen*. It fills the hero disc holding the portrait, both primary CTAs, the sticky bottom bar, the quiz progress fill, the selected option's dot, the selected chip's ring, the error field ring, the checkbox accent, and the confirmation tick. It appears nowhere as decoration. Its deeper cousin (`{colors.red-deep}`) exists solely as the CTA hover.

### Secondary
- **Structure Blue** (`{colors.blue}`): every mark that says *this is how the thing is organised*. Section eyebrow and its square, the numbered step markers, the quiz step counter, the pending-data label, the trust-row squares, the testimonial result label, links in the footer and consent line, the input focus ring, and the baseline grid itself (at 7% alpha). Blue is never a button.

### Tertiary
- **Warning Yellow** (`{colors.yellow}`): reserved for the triangle and for blocks that raise a caution or a commitment the reader must not skim — the pain-list triangles, the promise block, the inline field error, the send-failure notice, the waiting-slot marker. Yellow is a full-bleed background with ink text, never a text color.

### Neutral
- **Worktable** (`{colors.table}`): the page ground, and the recessed fill for recap/spot blocks and the progress track.
- **Plane** (`{colors.plane}`): white surfaces laid on the table — the bio plane, testimonials, quiz box, inputs, option rows, chips. Also the text color on red and blue fills.
- **Ink** (`{colors.ink}`): all primary text, plus the three heavy 3px divisions (hero bottom, quiz top, footer top) and the quiz box border.
- **Second Ink** (`{colors.ink-2}`): supporting prose, captions, sub-labels, the disabled CTA fill, and the dashed border of the unbuilt slot.
- **Ruling Line** (`{colors.rule}`): every hairline — section dividers, list rules, plane and input borders, the vertical thread between steps.

### Named Rules
**The Assigned Role Rule.** Red is action and active state. Blue is structure. Yellow is warning. A color never takes another's job, and no element gets a primary color for emphasis alone. If a new element cannot be classified as action, structure, or warning, it is ink.

**The One Pressable Red Rule.** Red on a surface either is the thing you press or is the thing you just chose. The hero disc is the single sanctioned non-interactive use, because it is the circle carrying the person who acts.

**The Ink-Or-Primary Rule.** There are no tints, no 60%-opacity accents, no hover washes. State changes swap a whole token (red → red-deep, rule → ink, rule → red), never a transparency.

## Typography

**Display Font:** Jost (with system-ui, sans-serif)
**Body Font:** Jost — the same family. There is no second face.
**Label Font:** Jost at 600, wide tracking, uppercase.

**Character:** Jost sits in the Futura/Renner geometric lineage, which is the workshop's own alphabet. Lowercase headings with −0.02em tracking read as drafted labels rather than marketing headlines; the wide-tracked uppercase eyebrow is the only place letters are shouted, and it is 0.8rem tall.

### Hierarchy
- **Display** (500, `clamp(2.1rem, 7.4vw, 3.6rem)`, 1.08, lowercase, balanced wrap): the hero H1 only. Its one emphasis device is `<em>` rendered non-italic in Signal Red.
- **Headline** (500, `clamp(1.55rem, 5vw, 2.3rem)`, 1.08, lowercase): section H2s.
- **Title** (500, 1.42rem, 1.15): the quiz question. Sentence case, because it is a spoken question, not a section label.
- **Subhead** (600, 1.1rem, sentence case via explicit `text-transform:none`): step headings and the signature name block.
- **Lead** (400, `clamp(1.06rem, 3.5vw, 1.22rem)`, 1.5, Second Ink, max 34ch in the hero): the hero sub and the pain closer.
- **Body** (400, 1.125rem, 1.6): default page text. Bold is 600, never 700, except the promise block and phone-number links which use 700.
- **Label** (600, 0.79–0.8rem, 0.13–0.14em, uppercase, Structure Blue): eyebrow, quiz step counter, pending-data key, waiting marker (this one in Second Ink).
- **Figure** (500, 1.5rem, tabular numerals): the fact list's left column, so verifiable numbers align.

### Named Rules
**The Single Alphabet Rule.** One family, full stop. Hierarchy comes from size, weight (400/500/600/700) and case, not from a paired face. Automated checks flag this build as `single-font`; that finding is an **accepted, documented exception**, not a defect. Single-alphabet typography is native to the Bauhaus foundation world and the measured ramp already separates every role. Do not "fix" it by adding a serif or a mono.

**The Lowercase Heading Rule.** H1 and H2 are lowercase, always. Anything that is a sentence addressed to the reader — step headings, the person's name — opts back into sentence case explicitly. Nothing is ALL CAPS above 0.8rem.

## Layout

A single-column measure on a ruled table. The container is 600px max with 24px gutters; at 820px and up it widens to 900px, and the quiz column deliberately stays narrower at 660px so the form never sprawls.

Spacing is a strict 8px module (`{spacing.u}`), and every padding, gap and margin in the build is a multiple of it (1×, 1.25×, 1.5×, 2×, 2.5×, 3×, 3.5×, 4×, 5×, 6×, 8×, 9×, 14×, 16×). Sections run 64px top / 72px bottom; the quiz closes with 128px of floor so the sticky bar never covers content.

The page background carries a real ruled baseline: a 1px horizontal line in Grid Blue repeated every 32px (4 modules). It is the ground, not a texture — it is why the module is legible at all.

Section joins are graded: hairline rules between ordinary sections, and a 3px ink division at the three structural cuts (below the hero, above the quiz, above the footer).

At the 820px breakpoint the hero **rebalances rather than shrinks**: it becomes a `1fr 300px` grid with the portrait disc at full 300px, the signature stacks under it, and the CTA caps at 420px instead of stretching.

### Named Rules
**The Module Rule.** Every spatial value is `calc(var(--u) * n)`. A raw px margin is a bug.

**The Rebalance-Not-Shrink Rule.** On wider viewports the composition redistributes weight (grid split, disc grows, CTA caps). Nothing simply scales up.

## Elevation & Depth

There is no elevation. Zero `box-shadow` in the build is used for depth — the only shadows present are `inset 0 0 0 1px/2px` strokes, which are borders drawn inward, not lifts. Depth is expressed by material instead: the Worktable ground, white Planes laid on it with a hairline rule, and three heavy 3px ink cuts that separate the page's structural acts. Recessed blocks (recap, spot, progress track) go the other way, filling with Worktable so they read as milled *into* the plane.

### Shadow Vocabulary
- **Focus / active stroke** (`box-shadow: inset 0 0 0 2px var(--blue)`): input focus, paired with a blue border.
- **Error stroke** (`box-shadow: inset 0 0 0 2px var(--red)`): invalid field, paired with a red border.
- **Selection stroke** (`box-shadow: inset 0 0 0 1px var(--red)`): selected chip, doubling its border weight without moving layout.

### Named Rules
**The No-Lift Rule.** Nothing floats. If an element needs to read as distinct, give it a plane, a rule, or a fill — never a drop shadow, and never a radius.

## Shapes

Radius is 0 everywhere except where the shape *is* a circle: the hero disc, the portrait thumbnails, the 15px dot inside the CTA, the selected option's dot, and the confirmation tick. Squares stay square; there is no 4px "softening" anywhere.

Borders are 1px `{colors.rule}` by default, 1px `{colors.ink}` on the quiz box (the one surface that is a working jig), 1px dashed `{colors.ink-2}` on the unbuilt slot, and 3px solid ink on the three structural cuts.

The recurring silhouette is the primary-form triad, available both as standalone elements (`.form-sq`, `.form-ci`, `.form-tr`) and as `::before` marks on components:

- **Square** (14px, or 10–11px as a mark): structure — eyebrow, trust items, testimonial result.
- **Circle** (14px, or 15px white inside the red CTA): action and active state — CTA, selected option.
- **Triangle** (14px tall, 8px half-base, or 12/7 as a mark): warning — pain items, waiting slot, send failure.

The triangle is built from border geometry (`border-left/right: transparent; border-bottom: N solid var(--yellow)`), which keeps it a real drawn form with no asset.

Gradients exist in this build and are legitimate, but only as *drafting operations*: the 1px baseline rule, the portrait's downward fade mask (`linear-gradient(to bottom, #000 84%, transparent)`), and the 135° hatch on the unbuilt slot. Gradients as decorative surface fills do not exist here.

## Components

### Buttons
- **Shape:** square (0 radius), full-width, capped at 420px on wide viewports.
- **Primary** (`.cta`, `.submit`): Signal Red fill, white 600-weight label at 1.09rem, 64px minimum height, with a 15px white circle set before the label — the button *is* the red circle vocabulary, applied. Measured contrast 4.98:1.
- **Hover / Active:** fill deepens to `{colors.red-deep}` over 160ms ease-out; pressing translates 1px down over 100ms.
- **Disabled:** Second Ink fill, default cursor, used while the form is submitting.
- **Focus:** a 3px Structure Blue outline at 2px offset — the same ring on every interactive element on the page.
- **Sticky bar:** the same red button at 56px inside a Worktable strip with a 1px ink top rule, sliding up from `translateY(125%)` in 300ms; it appears only between the hero and the quiz and hides on success.
- **Text button** (`.qback`): underlined Second Ink, 3px underline offset, no border or fill, with negative margins compensating a 10px/8px hit-area pad.

### Chips
- **Style:** white plane, 1px rule border, square, 52px tall, Second Ink label, two-column grid.
- **Selected:** red border plus a 1px inset red stroke, label goes Ink at 600. No fill change — the ring is the whole signal.

### Planes (the system's card refusal)
- **Corner Style:** none (0).
- **Background:** Plane white on the Worktable ground.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** 1px `{colors.rule}`.
- **Internal Padding:** 24px (40px on the quiz box above 820px).
- These are *not* cards: no radius, no shadow, no hover lift, no header/footer chrome.

### Inputs / Fields
- **Style:** white plane, 1px rule border, square, 56px minimum height, 14px/16px padding, inherited Jost at 1.09rem.
- **Focus:** border goes Structure Blue and an inset 2px blue stroke joins it; the default outline is suppressed because the ring replaces it.
- **Error:** border and inset stroke go Signal Red, and a yellow message block appears directly beneath with a 0.9rem ink label.
- **Placeholder:** `#6c7176`, measured at 4.93:1 — dim enough to read as a hint, above the 4.5:1 floor.
- **Consent checkbox:** 24px, `accent-color` Signal Red, inside a clickable label row.

### Option Rows (signature)
The quiz's answer buttons are the clearest statement of the form vocabulary. A full-width white plane, 62px minimum, square, with a 15px **outlined blue square** as its marker. On selection the marker fills red *and its border-radius animates to 50%* over 160ms — the square literally becomes the circle at the moment the answer becomes an active choice. The row border shifts rule → red; hovering shifts rule → ink. The title sits at 1.05rem with a 0.87rem Second Ink sub-line.

### Step List (signature)
Numbered 30px blue squares with white 600-weight counters, generated by CSS counters, connected by a 1px vertical rule from marker to marker. Structure is blue and structure is square; the thread makes the sequence legible without a container.

### Facts List
A definition list with an ink top rule and hairline row rules: a 1.5rem tabular-numeral term at 5.5ch minimum width against a 0.97rem Second Ink description. The `pending` variant swaps the term to a 1rem uppercase blue label — an honest structural marker for data that has not been supplied yet, not a decorative badge.

### Unbuilt Slot (signature)
The testimonial placeholder is drawn as unfinished on purpose: a 135° 9px hatch in Worktable over `#e6e5e1`, a 1px dashed Second Ink border, and an uppercase "waiting" marker led by the yellow triangle. It is visually impossible to mistake for a finished testimonial.

### Motion
Straight-line, short, mechanical. State transitions run 160ms ease-out; presses 100ms; the panel entry slides 28px in from the right over 320ms on `cubic-bezier(.2,0,0,1)`; the progress bar scales its X over 340ms on `cubic-bezier(.4,0,.2,1)`; the sticky bar 300ms. There is no fade-and-float, no blur, no spring. `prefers-reduced-motion: reduce` disables all animation, transition and smooth scrolling globally.

### Named Rules
**The Form-Marker Rule.** Every component-level indicator is one of the three primary forms, sized 10–15px, drawn in CSS as a `::before` or a `.form-*` element. No icon fonts, no SVG pictograms, no emoji glyphs in the component layer.

**The Square-Becomes-Circle Rule.** Selection is expressed by a blue square turning into a red circle. That transformation is the system's core interaction signature; do not replace it with a checkmark, a fill-only change, or a color-only change.

## Do's and Don'ts

### Do:
- **Do** classify every new element as action (red circle), structure (blue square), or warning (yellow triangle) before choosing its color. If it fits none, it is ink.
- **Do** build every spatial value as `calc(var(--u) * n)` on the 8px module, and keep the 32px baseline grid visible on the page ground.
- **Do** keep radius at 0 on everything that is not literally a circle.
- **Do** lay content on white planes with a 1px `{colors.rule}` border and no shadow.
- **Do** draw indicators as CSS geometry (`.form-sq` / `.form-ci` / `.form-tr` and their `::before` equivalents) at 10–15px.
- **Do** keep headings lowercase at 500 weight with −0.02em tracking, and let sentence-level headings opt out with `text-transform:none`.
- **Do** give every interactive element the same focus treatment: 3px Structure Blue outline at 2px offset.
- **Do** keep tap targets at 44px or more; the shipped floors are 64 (CTA), 62 (option), 56 (input, sticky), 52 (chip).
- **Do** mark content that is genuinely missing as visibly unbuilt (hatch, dash, "waiting" label) rather than filling it with plausible placeholder copy.
- **Do** use one typeface. The `single-font` finding on this build is an accepted exception, recorded here so it is not re-opened.

### Don't:
- **Don't** swap the color roles — no blue buttons, no red section labels, no yellow text.
- **Don't** introduce a fourth accent, a tint scale, or an opacity-based hover wash. State changes swap whole tokens.
- **Don't** add corner radius, drop shadows, or hover lift to planes. Inset strokes are the only permitted `box-shadow`.
- **Don't** use gradients as decorative surface fills. Gradients are permitted only as drafting operations — the baseline rule, the portrait mask, the hatch — because that is how this build already uses them.
- **Don't** add icon libraries, icon fonts, or SVG pictograms. Typographic arrows (`→`) and the three primary forms are the entire mark vocabulary.
- **Don't** set ALL CAPS above 0.8rem, or add a second typeface to create hierarchy.
- **Don't** apply these tokens to `index.html`, `admin.html`, `blog.html` or `gdpr.html`; those surfaces are a different, older identity and this system does not govern them yet.
- **Don't** lower a contrast value to make a design read better. The shipped floors are 4.98:1 on the primary action, 4.93:1 on placeholders, and ≥7.25:1 on all other text.
