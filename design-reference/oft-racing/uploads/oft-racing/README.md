# OFT Racing Shop — PiriCard design handoff

## Purpose

This is a research and design-direction package for Claude Design. Its purpose is to support the design of a new **OFT Racing Shop PiriCard profile** while preserving the recognizable PiriCard product DNA found in the current repository.

This package is intentionally **not an interface implementation**. No OFT Racing page, route, component, production data entry, or application refactor is included.

Research snapshot: **28 August 2026**.

## Read first

1. [VERIFIED-DATA.md](./VERIFIED-DATA.md) — factual source of truth and evidence status.
2. [PIRICARD-DNA.md](./PIRICARD-DNA.md) — what must remain recognizable as PiriCard and what may change.
3. [CONTENT-MAP.md](./CONTENT-MAP.md) — recommended information priority, not a page layout.
4. [DESIGN-DIRECTION.md](./DESIGN-DIRECTION.md) — emotional and visual direction without prescribing a finished interface.
5. [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) — unresolved items and clearly identified placeholders.

Supporting detail lives in [references/existing-piricard-patterns.md](./references/existing-piricard-patterns.md) and [references/asset-inventory.md](./references/asset-inventory.md).

## Non-negotiable evidence rules

- Do not invent business facts, services, contact methods, social URLs, brand relationships, reviews, testimonials, prices, or product availability.
- Treat **Confirmed facts**, **Observed signals**, **Design interpretation**, and **Unknown / to verify** as different evidence classes.
- “Observed in supplied social material” does not mean “official dealer”, “official representative”, or “currently stocked”.
- Do not expose WhatsApp, email, website, Google Reviews, or social actions until their exact destinations are verified.
- A placeholder may be used during design exploration only when it is visibly labelled as a placeholder in the design file.
- The information architecture should adapt to what is genuinely useful for this business. Do not force every section used by another profile.

## What Claude Design should produce later

A mobile-first PiriCard profile exploration for OFT Racing Shop, with responsive desktop behavior and useful missing-data states. It should feel like a specialist racing shop/workshop inside the PiriCard product—not a generic motorcycle website and not a clone of either existing profile.

## Package tree

```text
design-handoff/oft-racing/
├── README.md
├── PIRICARD-DNA.md
├── BUSINESS-BRIEF.md
├── CONTENT-MAP.md
├── DESIGN-DIRECTION.md
├── VERIFIED-DATA.md
├── OPEN-QUESTIONS.md
├── references/
│   ├── existing-piricard-patterns.md
│   └── asset-inventory.md
└── assets/
    └── README.md
```

The asset folder is intentionally empty of creative files. No authentic OFT Racing media exists in the repository, and unrelated client assets must not be reused.

