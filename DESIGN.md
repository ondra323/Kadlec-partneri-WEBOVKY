---
name: Kadlec — Druhý názor
description: A folder of plain, checkable pages — two surfaces, one green action, nothing lacquered.
colors:
  signal-green: "#00803f"
  signal-green-deep: "#006632"
  signal-green-soft: "#e7f2ea"
  on-signal: "#ffffff"
  ledger-navy: "#1c3564"
  caution-yellow: "#f5c400"
  caution-amber: "#b97e26"
  plane: "#ffffff"
  board-ground: "#f0f0ee"
  board-ink: "#141618"
  board-ink-2: "#4a4f54"
  board-ink-3: "#6c7176"
  board-rule: "#c9cbcd"
  board-hatch: "#e6e5e1"
  paper-ground: "#faf7f2"
  paper-recess: "#f1ede4"
  paper-ink: "#1d1f1e"
  paper-ink-2: "#50554f"
  paper-ink-3: "#787d76"
  paper-rule: "#e3ded4"
  paper-rule-strong: "#cfc8bb"
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
  body-dense:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
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
  figure-kpi:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0"
  soft: "12px"
  soft-lg: "14px"
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
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.on-signal}"
    typography: "{typography.subhead}"
    rounded: "{rounded.none}"
    height: "64px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.signal-green-deep}"
    textColor: "{colors.on-signal}"
  button-primary-disabled:
    backgroundColor: "{colors.board-ink-2}"
    textColor: "{colors.on-signal}"
  button-primary-paper:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.on-signal}"
    typography: "{typography.subhead}"
    rounded: "{rounded.soft}"
    height: "60px"
    width: "100%"
  button-sticky:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.none}"
    height: "56px"
    width: "100%"
  option-row:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
    height: "62px"
    width: "100%"
  chip:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.board-ink-2}"
    rounded: "{rounded.none}"
    padding: "10px"
    height: "52px"
  chip-selected:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.board-ink}"
  input-text:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
    height: "56px"
    width: "100%"
  plane-surface:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.board-ink-2}"
    rounded: "{rounded.none}"
    padding: "24px"
  plane-surface-paper:
    backgroundColor: "{colors.plane}"
    textColor: "{colors.paper-ink-2}"
    rounded: "{rounded.soft-lg}"
    padding: "24px"
  alert-block:
    backgroundColor: "{colors.caution-yellow}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  step-marker:
    backgroundColor: "{colors.ledger-navy}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.none}"
    size: "30px"
  count-badge:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.on-signal}"
    typography: "{typography.label}"
    rounded: "{rounded.circle}"
    size: "24px"
---

# Design System: Kadlec — Druhý názor

## Overview

**Creative North Star: "The Open Folder"**

The one physical thing a client ever receives from this practice is a folder: *desky* holding copies of their own contracts. The system is built as that folder opened on the table. Pages are plain sheets laid on a ground; a hairline is the edge of the paper; nothing is lacquered, embossed or lit. Whatever is on a sheet can be read, checked and handed back. That is the visual form of the position the business sells — a second opinion that includes the credible possibility of "change nothing" — and it is why polish is treated as a cost rather than a virtue. A wary person reads gloss as a sales signal; a plain sheet with a registration number on it reads as something they can verify.

The folder has two surfaces. **Board** is the cool grey card of the folder itself: squared, measured, a little severe, used where a stranger arrives cold from an ad and must decide in seconds (`konzultace.html`). **Paper** is the warm cream sheet inside: the same alphabet and the same colors, softer ground, used where the reader already knows who is talking and wants the story or the work (`spoluprace.html`, the override layer of `index.html`, `admin.html`). Both surfaces share one green action, one navy structure, one caution, one typeface and the three primary forms. They differ only in ground, ink temperature, heading case, and — on narrative pages — corner softness.

The system rejects three neighbouring worlds by name. It is not the green-and-gold "trustworthy finance" funnel the older `index.html` and `blog.html` still wear (forest green, gold, Playfair Display, trust badges, soft gradients). It is not the slick fintech app (glass, gradients, rounded shadowed cards, glowing numbers). And it is not brutalism for effect: everything is squared because it is measured, not because ugliness signals honesty.

**Key Characteristics:**
- One action color (Signal Green), one structure color (Ledger Navy), one warning family (Caution Yellow on Board, Caution Amber on Paper). No fourth accent.
- Two neutral families, chosen per surface, never mixed on one page.
- One typeface (Jost). Hierarchy by size, weight and case.
- Flat by construction: sheets, hairlines and inset strokes; no drop shadows.
- Square corners wherever someone works; soft corners only where someone reads a story.
- Indicators are drawn forms — square, circle, triangle — never icons.
- Missing evidence is shown as visibly unbuilt, never filled with plausible placeholders.

## Colors

Three colors with assigned jobs, two families of neutrals that set the temperature of a surface, and white sheets shared by both.

### Primary
- **Signal Green** (#00803f): the only color that means *press this*, *this is chosen* or *this went through*. Primary and sticky CTAs, the quiz progress fill, the selected option's circle, the selected chip's ring, input focus on Board, the consent checkbox, the submitted step in a funnel, the "new" count badge, a confirmed lead. Its deep cousin (#006632) exists for hover and for the large green plane behind the hero portrait. **Signal Green Soft** (#e7f2ea) is the one sanctioned tint (see the Paper Tint Rule).

### Secondary
- **Ledger Navy** (#1c3564): everything that says *this is how the thing is organised* or *this is how much*. Board eyebrows and their square, numbered step markers, the quiz step counter, the pending-data label, links in running text, the universal focus outline, magnitude bars in the admin, the square marker before a block heading. Navy is never a button.

### Tertiary
- **Caution Yellow** (#f5c400): the Board warning. A full-bleed block with ink text — the promise block, an inline field error, the send-failure notice — and the triangle mark. Never a text color.
- **Caution Amber** (#b97e26): the Paper warning. The largest funnel drop in the admin, the triangle on error and setup notices, the error toast marker. At 3.46:1 on white it is a fill and a mark, never body text.

### Neutral
- **Plane** (#ffffff): every sheet on both surfaces — bio and quiz boxes, inputs, option rows, chips, admin tiles and blocks. Also the text color on green and navy.
- **Board Ground** (#f0f0ee): the cool page ground of the ad landing, and the recessed fill for recap blocks and the progress track. **Board Ink** (#141618) for primary text and the three structural 3px cuts; **Board Ink 2** (#4a4f54) for supporting prose and the disabled CTA; **Board Ink 3** (#6c7176, 4.93:1) for placeholders and anonymous labels only; **Board Rule** (#c9cbcd) for every hairline; **Board Hatch** (#e6e5e1) for the unbuilt slot only.
- **Paper Ground** (#faf7f2): the warm page ground. **Paper Recess** (#f1ede4) for bar tracks and code wells; **Paper Ink** (#1d1f1e) and **Paper Ink 2** (#50554f) for text; **Paper Ink 3** (#787d76, 4.2:1) for decoration and non-essential meta, never for text that must be read; **Paper Rule** (#e3ded4) for hairlines and **Paper Rule Strong** (#cfc8bb) for control borders.

### Named Rules
**The Assigned Role Rule.** Green is action and confirmed outcome. Navy is structure and magnitude. Caution is warning. A color never takes another's job, and nothing gets a primary color for emphasis alone. If an element is not action, structure or warning, it is ink.

**The One Pressable Green Rule.** Green on a surface is the thing you press, the thing you just chose, or the thing that went through. The deep-green plane behind the hero portrait is the single sanctioned non-interactive use, because it carries the person who acts.

**The One Surface Per Page Rule.** A page is Board or Paper, never both. Board neutrals do not appear on a Paper page and the reverse.

**The Paper Tint Rule.** Board has no tints: state changes swap whole tokens. Paper allows exactly one tint, Signal Green Soft, as the resting ground under illustrations and as the fill of a positive status chip. No other color gets a light version.

**The Color-Never-Alone Rule.** Green and amber sit at ΔE 6.0 for protanopes. Any state they mark also carries text or a form beside the color: `● poptávka`, `▼ největší propad`, a circle, a triangle.

## Typography

**Display Font:** Jost (with system-ui, sans-serif)
**Body Font:** Jost — the same family
**Label/Mono Font:** Jost at 600, wide tracking, uppercase. A monospace face appears in exactly one place: literal code the operator must copy (the Firestore rule on the admin setup card).

**Character:** Jost belongs to the Futura line, the geometric alphabet of the Bauhaus workshop. Tight negative tracking on headings makes them read as drafted labels rather than marketing lines; the only shouted letters are the 0.8rem tracked labels.

### Hierarchy
- **Display** (500, `clamp(2.1rem, 7.4vw, 3.6rem)`, 1.08): the hero H1 only. Its single emphasis device is `<em>` rendered non-italic in Signal Green.
- **Headline** (500, `clamp(1.55rem, 5vw, 2.3rem)`, 1.08): section H2s. On Paper the clamp runs slightly larger (`clamp(1.6rem, 5vw, 2.35rem)`, 1.1).
- **Title** (500, 1.42rem, 1.15): the quiz question — sentence case, because it is spoken.
- **Subhead** (600, 1.1rem): step headings, the signature name, CTA labels.
- **Lead** (400, `clamp(1.06rem, 3.5vw, 1.22rem)`, 1.5, Ink 2, max 34ch in a hero): the sub-heading voice.
- **Body** (400, 1.125rem, 1.6) on Board landing pages; **Body Dense** (400, 1rem, 1.55) in the admin, where tables and lists are the work.
- **Label** (600, 0.8rem, 0.14em, uppercase): eyebrows, step counters, field names, tile captions. Navy with a square on Board; green with a circle on Paper.
- **Figure** (500, 1.5rem, tabular numerals): verifiable numbers in fact lists. **Figure KPI** grows to `clamp(1.5rem, 3vw, 2rem)` for admin tiles; 1.5rem is the floor.

### Named Rules
**The Single Alphabet Rule.** One family. Hierarchy comes from size, weight (400/500/600/700) and case. The `single-font` detector finding is an accepted, documented exception; do not answer it by adding a serif. The monospace code well is the only second face, and only for literal code.

**The Case-By-Surface Rule.** Board headings (H1–H3) are lowercase, always — sentences addressed to the reader opt back into sentence case explicitly. Paper headings are sentence case. Nothing anywhere is ALL CAPS above 0.8rem.

**The Tabular Number Rule.** Every number a reader might compare or check — figures, KPIs, durations, percentages, table values — uses tabular numerals.

## Layout

Space is a strict 8px module (`{spacing.u}`); every padding, gap and margin is a multiple of it, written as `calc(var(--u) * n)`. A raw pixel margin is a bug.

**Board** (`konzultace.html`) is a single column: 600px max with 24px gutters, widening to 900px at the 820px breakpoint; the quiz, the review wall and the meter stay at 660px so the form never sprawls. Sections run 64px top and 72px bottom; the quiz closes with 128px of floor so the sticky bar never covers content. At 820px the hero **rebalances rather than shrinks**: it becomes a two-column grid, the portrait cut-out stands on a deep-green plane, the signature stacks under it, and the CTA caps at 420px.

**Paper narrative** (`spoluprace.html`) is a 620px column carrying a vertical journey: a hairline axis with circular nodes, each step a sheet with its illustration on a green-soft ground.

**Paper operational** (`admin.html`) is a 1280px work surface: a sticky top bar, a row of joined KPI tiles (1px gutters that let the rule color show through), and blocks in one or two columns that collapse to one below 960px. Below 760px the tabs become a horizontally scrolling row, tiles go two-up and a lone last tile spans both columns.

Joins are graded on both surfaces: hairlines between ordinary sections, a 3px ink cut at structural acts (below the Board hero, above the quiz, above the footer, under the admin top bar).

### Named Rules
**The Module Rule.** Every spatial value is a multiple of 8px.

**The Rebalance-Not-Shrink Rule.** Wider viewports redistribute weight (grid split, portrait grows, CTA caps). Nothing simply scales up.

## Elevation & Depth

There is no elevation. No surface on any page uses a drop shadow for depth. Depth is material: a ground, white sheets laid on it with a hairline, recessed fills milled into a sheet, and the 3px ink cuts that separate acts. The only `box-shadow` values in the system are inset strokes — borders drawn inward so state changes never move layout.

The single sanctioned departure is the **review wall** on Board: speech-bubble sheets tilted a degree or two and overlapping, like pages spilled out of the folder. Tilt and stacking are allowed there and nowhere else; it still carries no shadow.

### Shadow Vocabulary
- **Focus outline** (`outline: 3px solid #1c3564; outline-offset: 2px`): every interactive element, both surfaces.
- **Input focus stroke** (`box-shadow: inset 0 0 0 2px #00803f` with a green border): text fields on Board.
- **Selection stroke** (`box-shadow: inset 0 0 0 1px #00803f`): selected chip and selected filter, doubling the border without moving layout.
- **Error stroke** (`box-shadow: inset 0 0 0 2px` in the error ring color): an invalid field, paired with the caution message beneath.
- **New-row stroke** (`box-shadow: inset 3px 0 0 #00803f` on the first cell): an unhandled inquiry in the admin table.

### Named Rules
**The No-Lift Rule.** Nothing floats. If an element must read as distinct, give it a sheet, a rule or a recess — never a drop shadow.

**The Spilled Pages Exception.** Tilt and overlap belong to the review wall alone. Nothing else rotates.

## Shapes

Corner language follows the job of the surface. Wherever someone works — answers a question, types a phone number, presses a button, reads a table — corners are square (`{rounded.none}`). Where someone reads a story, sheets soften to 12px for controls and 14px for containers. True circles (`{rounded.circle}`) appear only where the shape *is* a circle: the round portrait on narrow Board, avatars, the selected option, journey nodes, the count badge, the dot inside a CTA.

The recurring silhouette is the primary-form triad, drawn in CSS at 10–15px, as standalone elements or `::before` marks:

- **Square** (Ledger Navy): structure — eyebrows, block headings, step markers, page entries in a journey timeline.
- **Circle** (Signal Green): action and confirmed state — the selected option, Paper labels, a submitted form, a phone tap, a new-inquiry badge.
- **Triangle** (Caution): warning — pain items, the waiting slot, field and send errors, the largest funnel drop. Built from border geometry, never an asset.

Borders are 1px rule by default, 1px ink on the quiz box (the one working jig), 1px dashed Ink 2 on the unbuilt slot, 3px ink at structural cuts. The review wall's bubbles get drawn tails from the same border geometry, placed differently on each sheet. Gradients exist only as drafting operations — the portrait's fade mask and the 135° hatch on the unbuilt slot — never as decorative fills.

### Named Rules
**The Work-Square, Story-Soft Rule.** Square corners on every working surface (forms, quiz, buttons, admin). 12–14px corners only on narrative sheets. A new page picks one by its job, not by taste.

**The Square-Becomes-Circle Rule.** Selection is a navy outline square turning into a filled green circle (border-radius animating to 50% over 160ms). It is the system's interaction signature — on quiz options and on the admin's "my visits don't count" toggle. Do not replace it with a checkmark or a color-only change.

## Components

### Buttons
Plain, full-width, confident; the button is the green circle vocabulary applied.
- **Shape:** square on Board and in the admin (`{rounded.none}`); 12px on Paper narrative pages (`{rounded.soft}`).
- **Primary:** Signal Green fill, white 600 label at 1.1rem, 64px minimum on Board (60px on Paper), a 15px white circle before the label on Board. Capped at 420px on wide viewports. Measured contrast 4.98:1.
- **Hover / Active:** fill deepens to Signal Green Deep over 160ms ease-out; pressing moves it 1px down over 100ms.
- **Disabled:** Ink 2 fill, default cursor — used while a form is sending.
- **Sticky bar:** the same primary at 56px in a ground-colored strip with a 1px ink top rule, sliding up from below between hero and quiz, hidden after success.
- **Secondary (admin):** white sheet with a 1px strong rule, ink label; the border goes ink on hover.
- **Text button:** underlined Ink 2 with a 3px underline offset, padded to a 44px hit area.

### Chips
- **Style:** white sheet, 1px rule, square, 52px tall, Ink 2 label, two-column grid on the quiz.
- **Selected:** green border plus a 1px inset green stroke; the label turns ink at 600. The ring is the whole signal.
- **Status chips (admin):** Signal Green Soft fill with deep-green text and a leading `●` for a positive state; a caution-bordered chip with a leading `▲` for failure; a quiet rule-bordered chip for neutral states.

### Cards / Containers
The system refuses cards; it lays sheets.
- **Corner Style:** none on Board and admin; 14px on Paper narrative sheets.
- **Background:** Plane on the surface's ground.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px rule; the quiz box takes 1px ink.
- **Internal Padding:** 24px (40px on the quiz box from 820px; 16px on admin blocks below 760px).

### Inputs / Fields
- **Style:** white sheet, 1px rule (strong rule on Paper), square, 56px minimum on Board and 52px in the admin, 14px/16px padding, inherited Jost.
- **Focus:** on Board the border turns green and an inset 2px green stroke joins it. *Known deviation:* `admin.html` currently draws this stroke in navy; it should follow Board.
- **Error:** the field ring changes and a caution message appears directly beneath — a yellow block with ink text on Board, a recessed note led by an amber triangle in the admin. Messages name the problem and the recovery.
- **Placeholder:** Board Ink 3, 4.93:1.
- **Consent checkbox:** 24px, `accent-color` Signal Green, inside a clickable label row.

### Navigation
- **Admin top bar:** a white bar with a 3px ink cut beneath, the wordmark at the left, tabs as text with a 3px green underline on the active tab, a green count badge on Poptávky, the visit opt-out toggle and a text logout at the right. Tabs follow the ARIA tab pattern with arrow-key movement. Below 760px the tabs drop to a scrolling row.
- **Range control (admin):** a segmented row of square buttons; the chosen range fills ink with white text.

### Option Rows (signature)
The quiz's answer buttons: full-width white sheets, 62px minimum, square, a 15px navy outline square as the marker. On selection the marker fills green and becomes a circle over 160ms; the row border shifts rule → green, and hovering shifts it to ink. Title at 1.06rem with a 0.87rem Ink 2 sub-line.

### Step List (signature)
Numbered 30px navy squares with white 600 counters generated by CSS counters, joined by a 1px vertical rule. On Paper the same idea becomes the journey axis: 22px circular nodes on a hairline, filling green as each step scrolls into view.

### Unbuilt Slot (signature)
A placeholder drawn as unfinished on purpose: a 135° 9px hatch of Board Ground over Board Hatch, a 1px dashed Ink 2 border, and an uppercase "waiting" label led by a caution triangle. It cannot be mistaken for a finished testimonial, which is the point.

### Review Wall (signature)
Speech-bubble sheets in a loose grid, each on one of the system's fields (plane, ground, deep green, navy, yellow, ink) with a 1px ink border and a drawn tail placed differently per sheet, tilted by a small per-sheet angle. Text color follows the field so contrast holds; the speaker line carries a square in the current color. On entry the sheets fly in from different sides once; an accompanying meter reveals left to right with a clip-path. Only real, attributable statements belong here (see PRODUCT.md).

### Data Marks (admin)
Magnitude is one hue: Ledger Navy bars on a Paper Recess track, square ends, every value also printed as text. Two states may recolor a bar and always add words: Caution Amber with `▼ největší propad −n` on a funnel's largest drop, Signal Green with `● poptávka` on a submitted step. Each bar is focusable and shows a one-line ink tooltip with the derived detail. KPI tiles sit in a joined row; a lead tile turns its figure deep green and adds a green circle before its label.

### Journey Timeline (admin)
One visit as an ordered list: a tabular `m:ss` time, a form marker, the action. Navy outline square for a page, filled navy square for a form step, small ink square for a click, green circle for a submission or phone tap, amber triangle for errors, a small ink dot for other events. A hairline connects the markers.

### Motion
State changes are short and mechanical: 160ms ease-out for color, border and radius; 100ms for presses; the progress bar scales its X over 340ms on `cubic-bezier(.4, 0, .2, 1)`; the sticky bar slides over 300ms; quiz panels enter 28px from the right over 320ms on `cubic-bezier(.2, 0, 0, 1)`. Each page may have **one** authored entrance (the review wall's fly-in on Board, the journey nodes on Paper) using a soft ease-out such as `cubic-bezier(.16, 1, .3, 1)` with no overshoot. *Known deviation:* the journey nodes on `spoluprace.html` currently overshoot (`cubic-bezier(.34, 1.4, .5, 1)`). Content is visible by default and hidden only after script confirms it can reveal it; `prefers-reduced-motion: reduce` turns all of it off.

### Named Rules
**The Form-Marker Rule.** Every indicator is one of the three primary forms, 10–15px, drawn in CSS. No icon fonts, no SVG pictograms, no emoji in the component layer; a typographic arrow (`→`) is the only other mark.

**The One Entrance Rule.** One authored entrance per page, eased out, never overshooting. Everything else is a state change.

## Do's and Don'ts

### Do:
- **Do** classify every new element as action (green circle), structure (navy square) or warning (caution triangle) before choosing a color. If it is none of these, it is ink.
- **Do** pick one surface per page — Board for cold-traffic ad landings, Paper for the story, the main site and the admin — and use only that surface's neutrals.
- **Do** build every spatial value as `calc(var(--u) * n)` on the 8px module.
- **Do** keep corners square on working surfaces and soften to 12–14px only on narrative sheets.
- **Do** lay content on white sheets with a 1px rule and no shadow.
- **Do** give every interactive element the same focus: a 3px Ledger Navy outline at 2px offset.
- **Do** keep tap targets at 44px or more; shipped floors are 64 (CTA), 62 (option), 56 (input, sticky), 52 (chip), 44 (admin controls).
- **Do** print the value beside every colored mark, and pair every state color with a word or a form.
- **Do** use tabular numerals for every number a reader may compare.
- **Do** mark genuinely missing content as visibly unbuilt (hatch, dash, "waiting") rather than filling it with plausible placeholders.

### Don't:
- **Don't** drift into the green-and-gold "trustworthy finance" funnel: no forest green with gold, no Playfair Display, no trust badges, no soft reassuring gradients.
- **Don't** drift into the slick fintech app: no glass, no gradient surfaces, no rounded shadowed cards, no glowing numbers.
- **Don't** be ugly for effect. Squared means measured, not provocative.
- **Don't** swap color roles — no navy buttons, no green section labels on Board, no caution text.
- **Don't** add a fourth accent or a tint other than Signal Green Soft on Paper.
- **Don't** mix Board and Paper neutrals on one page.
- **Don't** add drop shadows or hover lift, and don't tilt anything outside the review wall.
- **Don't** set Caution Amber or Paper Ink 3 as body text; they fall below 4.5:1.
- **Don't** add a second typeface for hierarchy, or set ALL CAPS above 0.8rem.
- **Don't** let an entrance animation overshoot, or give a page more than one.
- **Don't** apply this system to `blog.html` or `gdpr.html`; they still wear the older identity. `index.html` is mid-migration through its override layer and should converge on Paper.
- **Don't** lower a contrast value to make a design read better. Floors: 4.98:1 on the primary action, 4.93:1 on placeholders, 4.5:1 on all body text.
