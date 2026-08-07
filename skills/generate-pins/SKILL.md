---
name: generate-pins
description: >
  Writes the approved Pinterest pin queue for Salty Mountain Digital — titles,
  descriptions, boards, dates, and times — from finished pin images. Use this skill
  whenever Chad wants to build, write, draft, or refresh a pin queue: "write this
  week's pins", "build the pin queue", "we need copy for the new masters", "make a
  queue from the latest batch", "generate pins for C3". It produces the CSV (plus a
  readable .md twin) that smd-pinterest-scheduler consumes. Do NOT use this to
  actually post or schedule to Pinterest — that's smd-pinterest-scheduler, which
  executes an already-approved queue.
metadata:
  version: "1.0.0"
  author: "Chad Kuhn"
---

# SMD Pin Queue Generator

Turn finished pin images into an approved, schedulable queue. This skill **writes copy
and assigns slots**; it never opens a browser and never posts. The handoff is a CSV under
`05_Social/pin-queues/` that `smd-pinterest-scheduler` reads row by row.

Cadence and board architecture come from **Brand HQ page 22** (5 fresh pins/day, one
collection board per pin, outbound clicks = north star). Copy voice comes from page 09
and the listing style spec. **If Notion conflicts with this skill, Notion wins** — fetch
the Brand HQ before a large run.

## Before you start — preflight

1. **Masters exist.** `05_Social/Pins/<slug>/` folders contain rendered layout PNGs. If
   the folders are empty, the art/export step hasn't run — stop, don't write copy for
   images that don't exist yet.
2. **Know the collection** for each slug (C1–C4). The slug prefix carries it; if a slug
   is ambiguous, ask rather than guessing the board.
3. **Know the start date** and whether this is a fresh queue or a continuation. Never
   overlap slots with an already-scheduled queue — check the newest file in
   `05_Social/pin-queues/` first.

## Step 1 — Inventory the masters

Run the builder in scan mode to see what's actually on disk:

```
python3 scripts/build_queue.py --pins-root "<SMD>/05_Social/Pins" --scan
```

It reports each slug, its detected collection, and how many usable layouts it has.
**Layouts `08_square` (1:1) and `09_long_pin` (2:1) are excluded automatically** — they
aren't 2:3 portrait and Pinterest deprioritizes them. Eight usable layouts per master is
the norm.

Do the arithmetic out loud before writing anything: `masters × usable layouts = total
pins`, and `total ÷ 5 = days of runway`. Tell Chad that number. 35 masters is 280 pins,
which is 8 weeks — that will not load in one sitting (see Load windows below).

## Step 2 — Write the copy — one pass per master, not per pin

**Copy is written per master, not per layout.** All 8 layouts of one image are the same
photograph and get the same title/description; only the layout differs. Writing 8 variants
of the same copy is wasted effort and makes the profile look spammy.

For each master, produce one `title` + one `desc` + optional `tags`. Formulas, per-collection
voice, and worked examples are in `references/copy-formulas.md` — **read it before writing
the first title.** The hard rules:

- **Title ≤100 chars.** No hashtags, no emoji, no ALL CAPS. Lead with the subject, not
  the brand.
- **Description ~150–300 chars**, ends with a soft Etsy nudge (never "BUY NOW").
- **Specificity rule:** name the actual place. "Acadia National Park" beats "coastal
  scene." Where the collection has elevation or a verse reference, include it.
- **No hashtags in the description** — page 22 doesn't use them.

Put the copy in a simple `copy.csv` (`slug,title,desc,tags`) next to the queue. The
builder joins it to the scanned layouts.

## Step 3 — Build the queue

```
python3 scripts/build_queue.py \
  --pins-root "<SMD>/05_Social/Pins" \
  --copy copy.csv \
  --start-date 2026-08-10 \
  --out "<SMD>/05_Social/pin-queues/week1-pin-queue.csv"
```

The builder handles everything mechanical:

- **Slots** — 5/day at 08:00, 11:00, 14:00, 17:00, 20:00 CT, per page 22.
- **Board** — mapped from the collection (C1→Atmospheric/Moody, C2→Scripture, C3→Vintage
  Americana, C4→Gallery Wall). One collection board per pin.
- **Paths** — absolute host paths for `file_upload`, built from `--pins-root`.
- **Interleaving** — this is the part that matters. It **round-robins across masters**
  so consecutive slots are different photographs. Master-by-master ordering would post
  the same image 8 times inside two days, which reads as spam and cannibalizes its own
  reach. Never hand-sort the CSV back into per-master blocks.
- **Load windows** — splits output into ~100-pin files (`…-load1.csv`, `-load2.csv`, …)
  because Pinterest's native scheduler caps at ~100 queued and ~30 days out.

Because slugs sort by collection prefix, the round-robin also produces long **same-board
runs**. That's deliberate: the board persists from one scheduled pin to the next, so a run
of same-board pins skips the board dropdown entirely — the slowest and most error-prone
step in the posting workflow. Every pin in the run is still a different photograph.

It also writes a `.md` twin beside the CSV for eyeballing.

## Step 4 — Review, then hand off

Print the first few rows and the per-load date ranges. Chad's review **is** the approval
gate — the scheduler treats the queue as already-signed-off, so nothing ambiguous should
survive this step.

Flag explicitly, every time:

- **Any C2 Scripture row.** Verse accuracy is Chad's call (page 12 / §9) and must be
  signed off *before* those rows go to the scheduler. Never approve them on his behalf.
- Masters with **missing copy** (the builder marks these `NEEDS_COPY` and refuses to
  count them as ready).
- Titles that ran long or descriptions that landed outside 150–300 chars — the builder
  warns; fix the copy rather than letting it through.

Then: *"Queue is ready at `<path>` — run smd-pinterest-scheduler to load it."*

## Guardrails

- **Never fabricate a verse.** For C2, the verse text and reference come from the image
  and the tracker. If you can't source it, write `NEEDS_COPY` and say so.
- **Never invent a peak, elevation, or park name** to make a line scan better. Every
  factual claim in a pin has to trace to the master's metadata.
- **Don't write copy for images you haven't confirmed exist.** Scan first.
- **Don't post.** This skill ends at a CSV. Scheduling is `smd-pinterest-scheduler`, and
  scheduling is going-live.
- **One collection board per pin.** Cross-posting to room/mood boards is a separate
  optional pass — fresh pins beat duplicates.
