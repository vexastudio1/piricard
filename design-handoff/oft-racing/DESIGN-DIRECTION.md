# OFT Racing Shop — design direction

This document sets a creative territory. It does not prescribe a finished interface, component tree, or layout.

## Desired emotional feel

- specialist, not mass-market;
- racing-aware, not costume-racing;
- energetic and mechanical, but still clear at a glance;
- locally grounded and approachable;
- product- and workshop-capable;
- raw enough to feel authentic, controlled enough to feel trustworthy.

The target is **specialist racing shop / workshop** inside a PiriCard utility experience.

## OFT identity and PiriCard identity

PiriCard should provide the quiet outer frame: recognizable mark, immediate actions, truthful data, live status, mobile ergonomics, and save/share utility. OFT should own the visual atmosphere inside that frame: photography, palette, type character, section treatment, and racing/mechanical cues.

The result should make both statements true:

- “This is clearly a PiriCard profile.”
- “This page could only belong to OFT Racing.”

## Color direction

### Evidence-led base

- black;
- white;
- orange.

These are observed signals, not final color specifications. Extract production colors from the approved official logo or original brand files.

### Recommended behavior

- Use black/near-black to establish mechanical weight and focus.
- Use warm white or controlled neutral surfaces for legibility and practical data.
- Use orange as a deliberate signal for actions, status accents, numbering, or motion—not as an all-purpose fill.
- Allow authentic photography and product colors to introduce variation.
- Keep manufacturer colors contextual to approved imagery; do not turn them into the page palette.

Test contrast for text, icons, status states, and focus rings. “Closed” and “open” states must not rely on orange/green alone.

## Photography direction

Priority:

1. OFT storefront/exterior with readable business identity.
2. Authentic shop interior or customer-facing retail area.
3. Authentic OFT workshop/mechanical scene.
4. Authentic OFT racing/off-road or community imagery.
5. Product detail imagery owned or approved by OFT.

Prefer documentary confidence over glossy manufacturer-campaign polish. Useful crops might show signage, a real working environment, material texture, motorcycles, or equipment without making the interface visually chaotic.

Do not source random internet images. Do not copy manufacturer campaign art into the final project without explicit rights. Until authentic media exists, use labelled neutral placeholders in the design file.

## Typography character

- A compact, assertive grotesk or squared sans can carry headings and actions.
- A highly legible sans should carry practical information and longer text.
- A restrained mono or numeric face may support hours, model/category tags, rating data, or small telemetry-like annotations.
- Avoid faux “motorsport” novelty fonts, distressed display faces for body copy, or condensed text that becomes difficult on mobile.
- Keep business name, status, call, and directions readable in a rapid thumb-scroll.

Typography may be more forceful than Auto Formigal and less hospitality-oriented than Boi na Brasa, but it should not sacrifice clarity.

## Graphical language

Possible cues, used sparingly:

- slanted cuts or direction lines derived from speed and movement;
- numbered section markers;
- technical labels, small caps, and disciplined data alignment;
- fine grid, route, timing, or mechanical-reference details;
- cropped image frames and high-contrast dividers;
- tactile card surfaces rather than generic glassmorphism.

The current shared profile already uses angled accent slashes. Claude may reinterpret that gesture for OFT, but should avoid simply recoloring the Auto Formigal skin.

## Cards, icons, and actions

- Keep the main action obvious and thumb-friendly.
- Let secondary actions be quieter but still fully legible.
- Use familiar icons for call, directions, reviews, social networks, hours, location, save contact, share, and QR.
- Pair icons with labels; do not rely on unexplained motorsport pictograms.
- Product/discipline cards can feel more editorial or catalogue-like than contact rows, so long as the distinction is clear.
- Reflow missing actions naturally rather than leaving empty slots.

## Motion philosophy

Motion is optional and secondary to speed.

- Use brief, purposeful feedback for taps, state changes, and section reveals if it improves comprehension.
- Avoid engine-rev theatrics, constant parallax, auto-playing video, or animation that delays actions.
- Respect `prefers-reduced-motion`.
- Keep the first useful content stable during image loading.

## Responsive direction

- Begin with the 320–430 px NFC/QR experience.
- Ensure the identity and at least the most important actions appear without a long preamble.
- Preserve 44 px minimum targets, safe-area padding, and readable one-handed interaction.
- At wider sizes, content may open into a broader editorial composition or columns, but mobile priority must remain evident.
- Do not assume the shared 430 px card or the restaurant's 960 px shell is mandatory; both are current variants.

## What to avoid

- generic black/orange motorcycle templates;
- corporate dealership gloss or luxury showroom language;
- car-repair visual clichés;
- unchecked checkerboard flags, flames, carbon-fibre textures, tyre tracks, or speedometer graphics;
- a wall of manufacturer logos implying official relationships;
- stock photos that could belong to any motorcycle business;
- long landing-page slogans before practical actions;
- invented services, stock, testimonials, or contact methods;
- excessive rounded “app cards” with no content distinction;
- copying Boi na Brasa's restaurant sections or Auto Formigal's exact compact skin.

## Design states Claude should account for

- no hero image yet;
- no official logo yet;
- direct Maps/review link pending;
- social URLs pending;
- email and WhatsApp absent;
- workshop service list pending;
- brand relationships unapproved;
- fresh rating/review count pending;
- long Portuguese address and closed-day schedule;
- open, closed-now, and next-opening states;
- reduced-motion and keyboard-focus states.

