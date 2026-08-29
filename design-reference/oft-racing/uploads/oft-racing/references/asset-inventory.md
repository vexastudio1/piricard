# Asset inventory and acquisition strategy

## Audit result

A full repository filename and text search found **no OFT Racing asset, source file, social capture, logo, photograph, or existing profile data**. Searches included `OFT`, `racing`, `motocross`, `enduro`, `KTM`, `Husqvarna`, `CFMOTO`, and `GASGAS` outside dependency/build output.

No file has been copied into this package because the only available business assets belong to Auto Formigal or Boi na Brasa. Reusing them would be misleading.

## PiriCard platform assets

| Filename | Format | Dimensions | Depicts | Recommended use | Source/confidence |
|---|---|---:|---|---|---|
| `public/brand/piricard-symbol.svg` | SVG | 1159 × 1107 viewBox metadata | PiriCard symbol | Canonical platform-symbol reference; use through the existing shared mark in implementation | Repository / high |
| `components/icons/PiriCardSymbol.tsx` | TSX inline SVG | Scalable | Runtime PiriCard symbol component | Best reference for current rendered symbol and inherited color behavior | Repository / high |
| `public/brand/pirilight-symbol.png` | PNG | 1254 × 1254 | PiriLight symbol | Studio/platform context only; do not substitute for the PiriCard mark | Repository / high |

These files remain at their canonical repository paths rather than being duplicated. The design handoff documents describe the lockup sufficiently when the folder is reviewed independently; request the official exported PiriCard brand asset if Claude's design environment cannot access the repository.

## Existing client assets — reference only

| Filename | Format | Dimensions | Depicts | Recommended possible use | Source/confidence |
|---|---|---:|---|---|---|
| `public/clients/autoformigal/cover/exterior-2026.png` | PNG | 1672 × 941 | Auto Formigal exterior | Study facade-as-identity pattern; never use in OFT design | Existing client asset / high |
| `public/clients/autoformigal/logo/autoformigal-approved.jpg` | JPEG | 1081 × 1080 | Auto Formigal logo | Study logo prominence only; never use in OFT design | Existing client asset / high |
| `public/clients/autoformigal/logo/autoformigal-official.png` | PNG | 1024 × 1024 | Alternate Auto Formigal logo file | Reference only | Existing client asset / high |
| `public/clients/autoformigal/logo/autoformigal.png` | PNG | 1024 × 1024 | Duplicate/alternate Auto Formigal logo file | Reference only | Existing client asset / high |
| `public/clients/boi-na-brasa/boi-na-brasa-header.webp` | WebP | 1672 × 941 | Restaurant facade and terrace | Study authentic physical-location hero; never use in OFT design | Existing client asset / high |
| `public/clients/boi-na-brasa/logo.jpg` | JPEG | 1254 × 1254 | Circular Boi na Brasa logo | Study business-specific logo framing only | Existing client asset / high |

## Existing process captures — reference only

The repository contains design concepts and QA screenshots under `outputs/`. They are useful for understanding past exploration but are not an asset library and are not all synchronized with the current source.

Notable captures:

- `outputs/qa-autoformigal-identity-mobile.png` — 375 × 812.
- `outputs/qa-autoformigal-identity-desktop.png` — 1425 × 940.
- `outputs/qa-profile-mobile.png` — 390 × 2552; historical treatment.
- `outputs/qa-profile-desktop.png` — 1440 × 1790; historical treatment.
- `outputs/design-concepts/auto-formigal-mobile.png` — 756 × 2081.
- `outputs/design-concepts/auto-formigal-desktop.png` — 864 × 1821.

Do not copy visual details from a screenshot without confirming them against the current source files listed in `PIRICARD-DNA.md`.

## Required OFT asset intake

| Priority | Asset | Preferred specification | Intended use | Verification needed |
|---:|---|---|---|---|
| 1 | Official OFT logo | SVG/PDF master; transparent PNG fallback at 1200 px+ | Identity block, metadata/social export, vCard logo | Owner approval and correct current version |
| 1 | Storefront/exterior hero | Landscape original, ideally 1600 × 900 or larger | Immediate physical-business recognition | Rights, date, crop suitability, readable signage |
| 2 | Shop interior | Landscape/portrait originals | Shop side and authentic atmosphere | Rights and current appearance |
| 2 | Workshop image | Working scene with safe customer/public context | Workshop side | Rights, privacy, safety, current accuracy |
| 2 | Racing/off-road image | Authentic OFT-owned/team-approved original | Culture/community section or secondary hero | Rights, rider consent, sponsor/brand visibility |
| 3 | Product/equipment images | OFT-owned or manufacturer-approved files | Product/category modules | Current availability and usage permission |
| 3 | Team/community images | Authentic event/community originals | Social identity | Consent and usage permission |
| 3 | Approved brand logos | Vector originals supplied with permission | Brand relationship module only if verified | Current relationship and trademark rules |

## Asset-handling rules

- Prefer original files over social-media screenshots or recompressed downloads.
- Record creator/owner, permission, acquisition date, and intended channels for every image.
- Preserve full-resolution originals outside optimized web derivatives.
- Provide meaningful alt-text notes describing the real scene, not marketing keywords.
- Avoid visible customer faces, license plates, or personal information unless use is approved.
- Do not infer official dealership relationships from logos visible in a photograph.
- Do not use random stock or manufacturer campaign imagery to fill gaps.
- Treat a placeholder as a labelled design-state artifact, not a publishable asset.

## Recommended folder naming after intake

```text
assets/
├── logo/
│   ├── oft-racing-primary.svg
│   └── oft-racing-monochrome.svg
├── hero/
│   └── storefront-original.ext
├── shop/
├── workshop/
├── racing/
└── rights-and-sources.md
```

Do not create these folders or filenames until the corresponding approved material exists.

