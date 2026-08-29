# PiriCard product DNA

## Evidence base

The current repository contains two published profiles:

- **Auto Formigal**, rendered through the shared compact profile system in `components/BusinessProfile.tsx` and `app/profile.css`.
- **Boi na Brasa**, rendered through a business-specific restaurant composition in `components/BoiNaBrasaProfile.tsx` and `components/BoiNaBrasaProfile.module.css`.

The conclusions below are based on their recurring product behavior, the shared data and utility layer, and the current visual assets. Neither business is treated as the universal template. A detailed comparison is in [references/existing-piricard-patterns.md](./references/existing-piricard-patterns.md).

## MUST FEEL LIKE PIRICARD

### 1. A quiet but unmistakable PiriCard frame

- Put a small PiriCard presence at the top before the business content.
- Preserve the shared PiriCard symbol and the readable `PiriCard` name as one compact lockup.
- Link the lockup or adjacent directory action back to the PiriCard directory.
- Keep the bar shallow and useful; it is product context, not a second hero.
- Allow the business accent to color the PiriCard symbol and the “Card” emphasis, while keeping the silhouette and name recognizable.
- Respect safe-area insets and a minimum 44 px interaction height.

Current evidence: both profiles use `PiriCardBrandMark`, which uses the same inline `PiriCardSymbol`; the symbol scales from the surrounding wordmark size through `.piricard-mark`. Auto Formigal uses a 52 px top bar plus safe-area inset; Boi na Brasa uses a 50 px bar.

### 2. Immediate business recognition

The opening screen should quickly answer:

- Which business is this?
- What kind of business is it?
- Where is it?
- Is it open now, or what are today's hours?
- What can I do immediately?

Both current profiles combine an authentic business image, logo, business name, category/descriptor, location, and live opening information near the top. Their exact composition differs.

For a physical business, the repository supports a storefront/facade image as a strong hero choice. It is a proven pattern, not a mandatory rule. OFT Racing should use it only when an authentic, approved image is supplied.

### 3. Utility before storytelling

PiriCard is reached primarily after an NFC tap or QR scan. The visitor is likely trying to act, not browse a campaign landing page.

- Keep call, directions, today's hours, address, reviews, and relevant social links easy to reach.
- Keep the first useful actions immediately after identity.
- Use short labels in Portuguese and pair icons with text where icons improve scanning.
- Maintain large, thumb-friendly targets: the current system uses roughly 44–62 px action heights.
- Avoid decorative preambles, generic value propositions, email-capture patterns, or long hero copy.

### 4. Clear action hierarchy

PiriCard actions are conditional, not a fixed set.

**Primary action**

- Usually the most likely immediate task. Both current profiles make **Ligar** visually prominent.
- OFT Racing should likely keep **Ligar** primary unless business research shows a more important verified conversion path.

**High-value secondary actions**

- **Como chegar** when a verified address or valid map destination exists.
- **Ler avaliações** only with a verified review destination.
- **Instagram** and **Facebook** only with exact verified URLs.
- **Guardar contacto** through the PiriCard vCard flow when the profile is production-ready.

**Conditional actions**

- **WhatsApp** only with a confirmed WhatsApp-enabled number.
- **Email** only with a confirmed business email.
- **Website** only with a confirmed official website. A directory or marketplace listing is not the business website.
- Business-specific actions, such as ordering in the restaurant profile, appear only when a real service and destination exist.

Do not render a disabled or dead action merely to keep a symmetrical grid. Reflow the available actions.

### 5. Practical information with progressive depth

The shared information pattern is:

1. identity and current status;
2. quick actions;
3. essential business information;
4. business-relevant content;
5. social proof where available;
6. full hours, location, contacts, and social destinations;
7. save/share/QR tools or a concise final utility area.

This is a priority model, not a mandatory section list. The repository demonstrates that a restaurant can justify menu and ordering content while an automotive workshop uses services and a gallery. OFT Racing should use only sections supported by useful evidence.

### 6. Trustworthy live and reusable utilities

- Opening status is computed in the `Europe/Lisbon` timezone and exposes the next opening time when closed.
- The full weekly schedule highlights the current day.
- Phone, email, website, WhatsApp, and maps destinations are validated or derived through `lib/links.ts`.
- Contact saving is a real vCard download, generated from the published business record.
- Sharing and QR use the permanent canonical profile URL, not a preview URL.
- External destinations open safely and visibly behave as external links.
- Missing optional data should omit its interface rather than create an artificial action.

### 7. Mobile-first rhythm and accessibility

- Design from a 320–430 px viewport outward.
- Use compact 16–20 px horizontal gutters, short sections, strong labels, and scannable rows.
- Preserve minimum 44 px interactive targets and visible focus states.
- Keep copy readable, with clear contrast and no information encoded by color alone.
- Make fixed bottom actions respect the safe-area inset and avoid covering content.
- Avoid excessive animation. Existing profiles support `prefers-reduced-motion`.
- Desktop may expand the composition, but must not weaken the NFC/QR mobile journey.

### 8. PiriCard closure

Both profiles end with a small PiriCard/PiriLight attribution. Exact wording differs, but the product should close with a discreet platform signature and, where useful, a route back to PiriCard.

## MAY CHANGE PER BUSINESS

### Visual system

- primary, secondary, accent, background, surface, text, muted, and border colors;
- typography personality and supporting type roles;
- photography crop, treatment, overlay, and gallery behavior;
- card shape, border radius, dividers, section backgrounds, and density;
- graphical motifs and icon treatment;
- button accent treatment and the relative prominence of verified business-specific actions;
- desktop maximum width and how content expands into columns.

### Content system

- section order after the essential top layer;
- whether an About section is useful;
- how products, services, activities, menus, or specialties are grouped;
- whether review summary, map embed, gallery, digital card preview, or final CTA adds value;
- business-language tone, provided it stays factual and concise.

### OFT-specific opportunity

The page may adopt a sharper, performance-led visual language—black, white, orange, mechanical details, decisive typography, and authentic shop/racing imagery—without changing the PiriCard symbol, utility-first hierarchy, mobile ergonomics, truthfulness rules, or action behavior.

## Reusable implementation reference

These are implementation references for understanding the product, not instructions to reuse a component unchanged:

| Concern | Current repository reference |
|---|---|
| Business data contract and optionality | `lib/businesses.ts` |
| Dynamic profile route and metadata | `app/[slug]/page.tsx` |
| Shared compact profile | `components/BusinessProfile.tsx` |
| Bespoke restaurant profile | `components/BoiNaBrasaProfile.tsx` |
| PiriCard mark | `components/PiriCardBrandMark.tsx`, `components/icons/PiriCardSymbol.tsx`, `app/globals.css` |
| Live opening state | `components/OpeningStatus.tsx` |
| Save contact | `components/ContactDownloadButton.tsx`, `app/api/contact/[slug]/route.ts`, `lib/vcard.ts` |
| Share and QR | `components/ProfileActions.tsx`, `lib/site.ts` |
| URL validation/derivation | `lib/links.ts` |
| Shared profile skin and rhythm | `app/profile.css` |

## Important current inconsistencies

- The shared mark component is consistent, but each profile supplies different wordmark markup and accent handling. Preserve the common symbol/name lockup; do not reproduce incidental color literals.
- Auto Formigal's top bar contains PiriCard plus Directory; Boi na Brasa also places Save Contact in the bar.
- Auto Formigal is constrained to a 430 px card at all sizes; Boi na Brasa expands to 960 px. There is no single desktop width rule.
- Auto Formigal's main actions are icon-led and data-driven; Boi na Brasa's quick actions are mostly text-led and include restaurant-specific actions.
- Boi na Brasa has a permanent three-action mobile dock. The shared `StickyProfileActions` component is conditionally rendered in code but `.profile-sticky-dock` is currently `display: none` with no enabling rule in `app/profile.css`.
- Review content exists only in Boi na Brasa and is hardcoded as a dated snapshot. Auto Formigal has no confirmed direct review URL and omits the feature.
- Auto Formigal derives a Google Maps search from the address; Boi na Brasa uses hardcoded directions, review, and map embed destinations.
- Auto Formigal social links live in the shared business record; Boi na Brasa social URLs are hardcoded in its component even though its business record has no `socialLinks`.
- The repository README describes `lib/businesses.ts` as the single source of truth, but Boi na Brasa duplicates substantial content, contact, map, social, menu, and review data in its component.
- Footer wording and destination behavior vary between profiles.
- Several images in `outputs/` show historical concepts or earlier profile treatments that do not match the current source. Use them as process evidence, not as the current product contract.

