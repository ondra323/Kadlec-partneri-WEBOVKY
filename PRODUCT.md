# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: ordinary people and small business owners in Jemnice and the surrounding South-Moravian towns (Moravské Budějovice, Dačice), roughly 30–60. They hold financial products they signed years ago — insurance, a mortgage, loans, savings, pension schemes — and no longer know whether the terms are still fair. They are not shopping for a product; they are looking for someone to tell them where they stand.

Their defining trait is wariness. Many have been cold-called by advisors before. They expect to be sold to, and they read polish as a sales signal. A plainer, more checkable presentation earns more trust from them than a slicker one.

Secondary: existing clients returning for a specific topic, arriving from a topic-targeted ad.

## Product Purpose

Ondřej Kadlec offers a "second opinion" (druhý názor) on a person's existing finances: he compares what they already hold against what the market currently offers, and tells them plainly which is better — including when the answer is "change nothing."

Success for a visit is one thing only: the visitor leaves a name and phone number for a callback. The consultation itself happens by phone and then in person.

## Positioning

The mechanism a competitor cannot truthfully copy: **he is paid by the institution, not by the client, and he says so — including that a "don't change anything" outcome costs him his commission and he will say it anyway.** Selling the credible possibility of "no" is the position.

Supporting truth: he started inside a bank. He knows that branch product recommendations follow the branch's sales plan, not the customer's need. That is why he left, and it is why the second opinion has content.

## Operating Context

- Reach is a paid social ad (Instagram/Facebook) → this landing page → a phone call within 24 hours → a 30-minute meeting in Jemnice, at the client's home, or online → a written comparison. Nothing is signed at the meeting.
- The comparison is produced in **a custom-built online system** (built in-house for this practice; the calculators on `index.html` are part of the same family). "Srovnání na papíře" in the copy is a figure of speech for "in writing, not just verbally" — **there is no standard printed comparison sheet artifact.**
- Clients do receive a physical artifact: **desky (a document folder) containing copies of their contracts.** This is the one real, handed-over object in the engagement, and the user wants it used as a motion/animation motif.
- He is a tied agent (vázaný zástupce) of the INSIA a.s. and ININVEST networks, supervised by the Czech National Bank (ČNB). IČO 14311569, Polická 1106, 675 31 Jemnice, tel. 733 651 217.

## Capabilities and Constraints

- `konzultace.html` is a `noindex` ad landing page, standalone from `index.html`; it is **not** required to inherit the main site's visual identity.
- The page rewrites hero, eyebrow, problem list, closing line, CTA label and `<title>` from a `?tema=` query param, one variant per ad: `pojisteni`, `hypoteka`, `uvery`, `investice`, `penze`. This message-match mechanism must survive any redesign.
- Lead capture is a 3–4 step quiz (topic → detail → urgency → name + phone + preferred call time), written to Firestore and mirrored by EmailJS. GDPR consent is required.
- Mobile-first: the overwhelming majority of traffic arrives from a phone.
- Language is Czech throughout, and it is genuinely spoken Czech, not translated marketing copy.

## Brand Commitments

- Name and voice: first-person, plain, unhurried, no superlatives. The strongest lines are admissions against interest ("přijdu o provizi a stejně vám to řeknu", "Řešit to zní jako ostuda, přitom je to jenom počítání"). Voice is binding; the visual world is not.
- **The consultation and the comparison are free to the client, but the word "zdarma" must not be used.** It reads as a hook and attracts people with nothing to solve. The price question is answered instead by stating who pays him.
- Nothing about the current green/gold, Playfair Display, or card-based treatment of `konzultace.html` is binding — it is being replaced.

## Evidence on Hand

Real and usable: ČNB tied-agent status and the INSIA/ININVEST affiliation; IČO and the Polická 1106 address; the phone number; portrait photography (`assets/ondrej-kadlec.jpg`, `assets/ondrej-hero.webp`); the custom comparison system; the desky handed to clients.

**Not on hand — must not be fabricated:**
- Real testimonials. The three on the page and the one beside the phone field are placeholders ("Jméno Příjmení") and their avatar images do not exist. Any testimonial must carry a real name, town and result, or be removed.
- Verified counts. "100+ rodin" and "15+ bank a pojišťoven" are unverified round numbers. A named list of the institutions he actually works with does not exist yet but would be stronger.
- A photograph of the desky or of a real comparison.

The user has deferred supplying all of the above; work must be built so it holds without them and marks every waiting slot explicitly.

## Product Principles

1. **Credibility beats polish for this audience.** When a choice trades trust against slickness, trust wins.
2. **Say what it costs you.** The admissions against interest are the product; they get the most prominent placement, not the least.
3. **Checkable over impressive.** A registration number someone can look up outranks a round number they cannot.
4. **Never introduce the frame you are denying.** Do not say "spam", "no obligation, 100%", or "zdarma" to reassure; state the fact that makes the reassurance unnecessary.
5. **The ask is a phone number from a wary person.** Every element is judged by whether it makes that specific moment easier or harder.

## Accessibility & Inclusion

Audience skews older; small type at low opacity is a real exclusion, not a style choice. Body text ≥4.5:1 and the primary action must pass at its actual size. Touch targets ≥44px. The page must remain fully operable by keyboard, and error states must name both the problem and the recovery.
