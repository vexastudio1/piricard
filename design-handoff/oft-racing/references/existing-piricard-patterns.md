# Existing PiriCard patterns — repository audit

## Audit scope

Repository inspected on **28 August 2026**. The project has two published businesses in `lib/businesses.ts`: Auto Formigal and Boi na Brasa. No other business profile or OFT Racing entry exists.

The audit covered:

- route, metadata, data contract, canonical URLs, URL helpers, vCard generation, and tests;
- all profile and shared utility components;
- shared and business-specific CSS;
- published business assets;
- design-reference and output screenshots;
- full repository search for OFT/Racing and named product/brand signals.

## Architecture map

| File | Role | Handoff significance |
|---|---|---|
| `lib/businesses.ts` | Typed business records, themes, optional fields, layout variant | Intended single source of truth and evidence-aware optionality |
| `app/[slug]/page.tsx` | Static profile route and metadata | One route serves published businesses; no copied page per client |
| `components/BusinessProfile.tsx` | Shared compact/editorial profile orchestration | Auto Formigal's current profile implementation |
| `components/BoiNaBrasaProfile.tsx` | Bespoke restaurant profile | Proof that business-specific information architecture and visuals may diverge |
| `app/profile.css` | Shared profile skin and utility styles | Mobile compact rhythm and reusable action/information treatment |
| `components/BoiNaBrasaProfile.module.css` | Restaurant-specific visual system | Wider responsive layout and content-specific styling |
| `components/PiriCardBrandMark.tsx` | Shared symbol + caller-supplied wordmark lockup | Common PiriCard recognition across variants |
| `components/icons/PiriCardSymbol.tsx` | Inline vector symbol | Same silhouette, theme-adaptable color |
| `components/OpeningStatus.tsx` | Lisbon-time status, today's hours, weekly schedule | Core practical utility |
| `components/ContactDownloadButton.tsx` | Downloads generated vCard | Save-contact action |
| `components/ProfileActions.tsx` | Share, QR, optional card download | PiriCard digital utility layer |
| `components/StickyProfileActions.tsx` | Conditional call + WhatsApp/directions dock | Intended persistent action pattern; currently hidden by shared CSS |
| `components/BusinessPhotoGallery.tsx` | Image/placeholder gallery and lightbox | Optional content, not required DNA |
| `components/DigitalBusinessCard.tsx` | Branded contact-card preview | Optional profile utility treatment |
| `lib/links.ts` | Validates phone/email/WhatsApp/web URLs and derives Maps search | Prevents unsupported/broken actions |
| `lib/vcard.ts` | Escaped, folded vCard content | Trustworthy save-contact implementation |
| `lib/site.ts` | Permanent canonical origin | QR/share should not use temporary preview URLs |

## Profile comparison

| Dimension | Auto Formigal / shared compact profile | Boi na Brasa / bespoke restaurant profile | Product conclusion |
|---|---|---|---|
| Shell | Max 430 px; mobile-card treatment remains on desktop | Max 960 px; content expands into desktop columns | Mobile-first is shared; desktop width is customizable |
| Top bar | 52 px + safe area; PiriCard + Directory | 50 px; PiriCard + Directory + compact Save Contact | Small PiriCard context is core; secondary controls can vary |
| PiriCard mark | Shared symbol, 15 px wordmark, accent from business theme | Shared symbol, 14 px wordmark, ember/orange adaptation | Preserve mark and name; allow controlled business accent |
| Hero | 180 px cover with accent border | 16:9 image up to 400 px with fade and location pill | Authentic business image is recurring; treatment is business-specific |
| Logo | 100 × 92 clipped plaque overlapping hero | 104 × 104 circular badge overlapping hero | Strong logo identity is recurring; shape is not fixed |
| Identity | Name, category, city, live status, short description | Name, category/descriptor, address, live status/today, rating badge | Immediate identity and practical status are core |
| Direct details | Phone and email rows before actions | Phone/address included in identity/essential information | Content may move; important data remains easy to scan |
| Primary actions | Call first; directions, save contact, optional WhatsApp | Call, directions, menu, order | Hierarchy adapts to the business and verified destinations |
| Action layout | One full-width primary + 2-column secondaries | 4 columns desktop, 2 columns mobile | No fixed grid; keep touch targets and priority |
| Essential content | Website/address/today, services, hours, social, gallery | Essential grid, social, about, menu, reviews, visit, contacts | Section set is business-specific |
| Reviews | Omitted because no confirmed direct URL | Dated rating/count/distribution and direct link, hardcoded | Reviews are conditional and must be sourced/fresh |
| Map | External Maps search derived from address | Hardcoded directions plus embedded map | Directions are core when valid; embed is optional |
| Social | Data-driven Instagram/Facebook | Hardcoded Instagram/Facebook in page component | Social is useful, but destination sourcing is inconsistent |
| Save/share/QR | Save action, digital card, share, QR | Save contact in top bar; no share/QR section | Digital utilities may be surfaced differently |
| Sticky actions | Component mounted conditionally, but hidden by CSS | Permanent mobile bottom bar with call/directions/order | Persistent-action implementation is inconsistent |
| Footer | “Perfil criado com PiriCard” + `piricard.pt` | Business details + “Perfil PiriCard criado por PiriLight Studio” | Discreet platform attribution is shared; wording varies |

## Recurring mobile measurements

These are observations, not rigid tokens:

- horizontal gutters: commonly 20 px, reducing to 16 px on very narrow screens;
- touch targets: generally 44–62 px tall;
- action gaps: commonly 8–10 px;
- compact top bar: approximately 50–52 px plus safe-area handling where implemented;
- identity logo overlap: approximately 42–44 px into the hero boundary;
- section separation: borders, background shifts, and 24–32 px padding rather than large landing-page whitespace;
- live status and today's hours appear close to the identity;
- mobile actions use one or two columns and avoid icon-only ambiguity.

## Data-driven availability behavior

The shared profile computes safe links before rendering:

- phone → `tel:` only after number validation;
- WhatsApp → `wa.me` only when a WhatsApp value exists and validates;
- email → `mailto:` only after basic validation;
- website/social → only HTTP(S) URLs;
- Maps → direct URL when supplied, otherwise address-based Google Maps search;
- review action → only if a direct URL exists in the relevant implementation;
- vCard → includes only present business fields.

This is a core PiriCard trust pattern and should carry into OFT design annotations.

## Header/branding findings

The genuinely shared unit is the `PiriCardBrandMark` and `PiriCardSymbol`. The caller supplies the wordmark markup, so typography and `Card` emphasis vary. The icon inherits `--brand-mark-color`, normally a business accent. This creates an effective balance: same symbol/name, business-sensitive color.

Current inconsistencies:

- different semantic containers (`header` in shared profile, `nav` in restaurant profile);
- different top-bar actions;
- different literal accent colors for the `Card` portion rather than one documented contrast rule;
- only the shared top bar explicitly adds safe-area inset to its height/padding.

Design recommendation: preserve a consistent symbol/name lockup, minimum interaction sizes, top placement, directory affordance, and safe-area behavior. Adapt accent color only after contrast checks.

## Action findings

- Call is the most consistent primary action.
- Directions is consistently high value.
- Save Contact appears in both, but in different locations and with `Adicionar contacto` / `Guardar contacto` wording.
- Boi na Brasa appropriately adds menu and ordering because those destinations are real and business-specific.
- The shared profile supports WhatsApp but Auto Formigal correctly omits it because no number is confirmed.
- Email and website are absent from Boi na Brasa because its record does not provide them.
- Review UX is not yet a reusable shared pattern.

Design recommendation: for OFT, rank by post-tap utility and verified availability. Do not design a mandatory six-button grid.

## Information-architecture findings

Shared principles:

- identity and action before long-form content;
- current status near the top and full hours later;
- practical location/contact information remains scannable;
- content modules match the business type;
- PiriCard utility closes or supports the journey.

Not shared:

- a universal About section;
- a universal Services section;
- a universal review block;
- a universal gallery;
- a universal map embed;
- a fixed final CTA.

## Inconsistency and risk register

1. **Single-source-of-truth drift.** `README.md` says all profile data originates in `lib/businesses.ts`, but Boi na Brasa hardcodes essential information, social links, menu, ratings, directions, map coordinates, contacts, and prose in its component.
2. **Review freshness.** Boi na Brasa includes dated rating data and a hardcoded distribution; there is no shared freshness mechanism.
3. **Theme duplication.** The Boi na Brasa business record contains theme values, but its CSS module redefines a separate `--bnb-*` palette.
4. **Sticky-action divergence.** Boi's dock is always fixed; the shared dock has thoughtful intersection logic but is never visually enabled by current CSS.
5. **Label drift.** Save-contact language varies across contexts.
6. **Maps behavior.** Direct place/directions/embed URLs exist for one profile; the other relies on address search.
7. **Social data location.** Auto social URLs are in the business record; Boi social URLs are in the component.
8. **Brand-bar behavior.** Safe-area and action content differ between profile variants.
9. **Historical outputs.** `outputs/qa-profile-mobile.png` and several design-concept captures show treatments that differ materially from the current source. They should not overrule the implementation audit.
10. **Asset metadata mismatch.** Boi na Brasa's `socialImage` points to `/clients/boi-na-brasa/fachada.jpg`, but that file is not present; the existing header file is `boi-na-brasa-header.webp`.

## Visual evidence files

| File | Dimensions | What it shows | Use |
|---|---:|---|---|
| `public/clients/autoformigal/cover/exterior-2026.png` | 1672 × 941 | Auto Formigal exterior/facade | Evidence for authentic physical-location hero pattern only |
| `public/clients/autoformigal/logo/autoformigal-approved.jpg` | 1081 × 1080 | Approved Auto Formigal logo artwork | Evidence for strong logo block only |
| `public/clients/boi-na-brasa/boi-na-brasa-header.webp` | 1672 × 941 | Boi na Brasa facade and terrace | Evidence for facade hero pattern only |
| `public/clients/boi-na-brasa/logo.jpg` | 1254 × 1254 | Circular restaurant logo | Evidence for business-specific logo treatment only |
| `outputs/qa-autoformigal-identity-mobile.png` | 375 × 812 | A compact Auto Formigal identity/action capture | Supporting visual evidence; compare with current source |
| `outputs/qa-profile-mobile.png` | 390 × 2552 | Earlier full-profile concept | Historical, not authoritative |

None of these business assets may be reused for OFT Racing.

