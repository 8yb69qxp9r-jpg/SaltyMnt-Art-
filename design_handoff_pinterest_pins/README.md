# Handoff: Salty Mountain — Pinterest Pin Templates

## Overview

Ten Pinterest pin templates for **Salty Mountain Digital**, a printable-art Etsy shop selling black-and-white minimalist Colorado 14er summit-view prints. The pins are engagement-optimized: 2:3 vertical (1000×1500), brand-locked typography, consistent CTA placement, and a shared image-slot system so the user can drop a single hero photo and see seven pins update at once. The remaining three pins (3, 4, 9) have per-peak slots for gallery-set and carousel layouts.

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — prototypes that show intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (React, Next.js, etc.) using its established patterns and libraries. If no environment exists yet, choose the most appropriate framework for the project.

The image-slot drop-and-fill behavior is implemented here as a custom web component (`image-slot.js`) with a sidecar JSON file persisting drops. In production, you should replace this with whatever upload/state pattern the target app uses (e.g. an `<input type="file">` with controlled React state, an S3 upload flow, etc.).

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and copy are settled. Recreate pixel-perfectly at the native 1000×1500 resolution. Every measurement in `pins.jsx` (font sizes, margins, padding, frame coordinates) is the canonical value.

## Pin Templates (10)

All pins share these constants:
- **Canvas:** 1000×1500 px (Pinterest 2:3 optimal)
- **Brand wordmark:** top-left, 36px from top, 40px from left
- **"Shop on Etsy" CTA badge:** bottom-right, 36px from edges, pill-shaped
- **Typography:** Cormorant Garamond (serif headlines) + JetBrains Mono (caps/data)
- **Color palette:** ink `#0e0e0e`, paper `#f4f1ec`, fog `#a9a59f`, stone `#3a3633`

### Pin 01 — Hero (Mt. Elbert)
Full-bleed summit photo, dark gradient overlay top + bottom, peak name in 138px Cormorant, elevation/view/time-of-day data row in 22px Mono caps. Wordmark + Etsy badge in light variant.

### Pin 02 — Lifestyle (in-room mockup)
Real bedroom photo (`bedroom.jpg`) anchored at y=420 inside the 1500px canvas, 1000px wide. An image-slot is positioned exactly over the existing wall art frame above the bed: `left: 360, top: 598, width: 280, height: 168`, wrapped in a black mat (6px padding) + white inner mat (10px padding). Headline "Quiet walls. Loud mountains." in 88px Cormorant, mixed roman + italic. Bottom caption "Printable Wall Art · Colorado 14ers" in 16px Mono caps.

### Pin 03 — Triptych
Three framed prints in a row, gently rotated (-3°, 0°, +3°). Headline "The Sawatch Triptych" in 92px Cormorant. Per-peak captions and "$14" price tease bottom-left.

### Pin 04 — Six-Print Grid (Sawatch Range)
Dark background. 3×2 grid of framed prints, each captioned with peak + elevation. Headline "Sawatch Range" in 96px Cormorant. "$22 set of six" price tease bottom-left.

### Pin 05 — Before/After
Top half: original color photo with caption tag "The Photo." Bottom half: same photo rendered B&W with tag "The Print." Center divider "becomes" in italic Cormorant 44px. Bottom caption explains the value prop in 44px Cormorant italic.

### Pin 06 — Editorial Typographic
Massive 280px Cormorant peak name "Mount Massive" dominates the upper canvas. Print inset bottom-right (380×510). Data block bottom-left listing range/elevation/view/rank. "№ 06 of 58" italic tag bottom-left.

### Pin 07 — Map Locator (Longs Peak)
Colorado outline + dot top-left, peak name beside it. Centered framed print with tri-column caption row beneath (Front Range · view from the keyhole · 14,259 FT). Italic value-prop line near bottom.

### Pin 08 — Elevation Hook
Full-bleed background photo with center-stacked "The view from / 14,433 ft / Mount Elbert · sunrise" — number is 280px Cormorant with "ft" superscripted at 100px. Light wordmark/badge.

### Pin 09 — Carousel Tease
Dark background, headline "Swipe through the range." Four overlapping framed prints fanned with rotation -8°, -2°, +4°, +9°, captioned per peak. "See all 6 →" cue bottom-left.

### Pin 10 — Honesty / Process Manifesto
Small thumbnail top-right. Headline "AI-rendered. Hand-curated. *Gallery print.*" in 76px Cormorant. Three-column process explainer (Render / Curate / Tone) at the bottom with italic numerals.

## Linked Image System (key UX requirement)

Pins **1, 2, 5, 6, 7, 8, and 10** share a single image slot id `shared-hero-mountain`. When the user provides one photo, all seven pins update simultaneously. Pins 3, 4, and 9 have per-peak slots that remain independent.

Implementation in production:
- Either lift the shared image into app-level state and pass it as a prop to each pin component
- Or use a context provider keyed by slot-group identifier
- The other 9 unique slot ids are: `pin03-a/b/c`, `pin04-elbert/massive/harvard/laplata/antero/princeton`, `pin09-bierstadt/evans/longs/pikes`

## Design Tokens

```js
const colors = {
  ink:   '#0e0e0e',
  paper: '#f4f1ec',
  fog:   '#a9a59f',
  stone: '#3a3633',
};

const fonts = {
  serif: '"Cormorant Garamond", "Times New Roman", serif',
  mono:  '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  sans:  '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

const layout = {
  pinWidth: 1000,
  pinHeight: 1500,
  wordmarkOffset: { top: 36, left: 40 },
  ctaOffset:      { bottom: 36, right: 36 },
};
```

Google Fonts URL used during dev:
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap
```

## Brand Rules (from style spec)

- **Pure neutral B&W only** for mountain imagery — no sepia, no tints. Apply `filter: grayscale(100%) contrast(1.06)` to dropped images on every pin **except** Pin 05's top "color" panel, which stays original.
- **Specificity rule:** every pin must show a named peak + elevation + view direction.
- **No emoji.** No drawn iconography for mountains — use real photography only.
- **AI disclosure** is a feature, not a liability — Pin 10 leans into it.

## Assets

- `assets/bedroom.jpg` — 612×408 attic bedroom photo, used as Pin 02 background
- `assets/summit_01.png`, `assets/summit_02.jpg` — reference summit photos for development; replace with real per-peak photography for production

## Files in this bundle

- `Pinterest Pin Templates.html` — the host that mounts the design canvas and lays out all 10 pins
- `pins.jsx` — the 10 pin components, layout constants, and shared style tokens (this is the canonical reference)
- `design-canvas.jsx` — pan/zoom presentation canvas (dev tool — not part of production output)
- `image-slot.js` — drop-target web component used during design (replace with the target app's upload mechanism)
- `assets/` — reference imagery

## Production Notes

1. The design canvas is for review only. In production, render each pin as a standalone exportable surface (PNG export or react-to-image) at native 1000×1500 for direct upload to Pinterest.
2. Consider adding a lightweight admin UI: one image upload, one Pinterest export button per pin, copy-editing for peak/elevation per template.
3. SEO/discoverability win: encode peak name + elevation as the Pinterest pin description automatically, sourced from the same data that drives the visible text.
