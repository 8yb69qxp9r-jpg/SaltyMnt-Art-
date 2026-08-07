#!/usr/bin/env python3
"""Build an SMD Pinterest pin queue from rendered masters + a copy sheet.

Scans 05_Social/Pins/<slug>/*.png, joins per-master copy, assigns page-22 slots
(5/day at 08:00/11:00/14:00/17:00/20:00 CT), maps collections to boards, and writes
the CSV that smd-pinterest-scheduler consumes — split into ~100-pin load windows.

  Scan only:   build_queue.py --pins-root <PINS> --scan
  Build:       build_queue.py --pins-root <PINS> --copy copy.csv \
                              --start-date 2026-08-10 --out <QUEUES>/week1-pin-queue.csv
"""

import argparse
import csv
import os
import re
import sys
from datetime import date, datetime, timedelta

# Layouts that are not 2:3 portrait. 08 is square (1:1), 09 is a long pin (2:1).
EXCLUDED_LAYOUTS = ("08_square", "09_long_pin")

# Page-22 rhythm: 5 fresh pins/day, Central time.
DAILY_SLOTS = ("08:00", "11:00", "14:00", "17:00", "20:00")

# Collection -> board. One collection board per pin (page 22).
BOARDS = {
    "c1": "Atmospheric Landscape Wall Art",
    "c2": "Scripture Wall Art — Cinematic",
    "c3": "Vintage National Park & Americana Posters",
    "c4": "Gallery Wall Ideas & Sets",
}

DEFAULT_LINK = "https://saltymntdigital.etsy.com/"
SCHEDULER_CAP = 100  # Pinterest's native scheduler holds ~100 queued pins, ~30 days out.

TITLE_MAX = 100
DESC_MIN, DESC_MAX = 150, 300

FIELDS = ["date", "time", "time_12h", "board", "image", "path", "title", "desc", "tags", "link"]


def collection_of(slug):
    """C1-C4 from the slug prefix, e.g. 'c3_acadia_coast_wpa_...' -> 'c3'."""
    m = re.match(r"^(c[1-4])[_-]", slug.lower())
    return m.group(1) if m else None


def to_12h(hhmm):
    """'14:00' -> '2:00 PM' — the form the scheduler picks in Pinterest's time dropdown."""
    t = datetime.strptime(hhmm, "%H:%M")
    hour = t.hour % 12 or 12
    return f"{hour}:{t.strftime('%M %p')}"


def scan_masters(pins_root):
    """Return [(slug, collection, [layout_filenames])] sorted by slug."""
    if not os.path.isdir(pins_root):
        sys.exit(f"error: --pins-root not found: {pins_root}")

    masters = []
    for slug in sorted(os.listdir(pins_root)):
        folder = os.path.join(pins_root, slug)
        if not os.path.isdir(folder) or slug.startswith("."):
            continue
        layouts = sorted(
            f for f in os.listdir(folder)
            if f.lower().endswith(".png")
            and not f.startswith(".")
            and not any(f.startswith(x) for x in EXCLUDED_LAYOUTS)
        )
        masters.append((slug, collection_of(slug), layouts))
    return masters


def load_copy(path):
    """slug -> {title, desc, tags, board?}. Board is an optional per-master override."""
    if not path:
        return {}
    if not os.path.isfile(path):
        sys.exit(f"error: --copy file not found: {path}")

    out = {}
    with open(path, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            slug = (row.get("slug") or "").strip()
            if not slug:
                continue
            out[slug] = {
                "title": (row.get("title") or "").strip(),
                "desc": (row.get("desc") or "").strip(),
                "tags": (row.get("tags") or "").strip(),
                "board": (row.get("board") or "").strip(),
            }
    return out


def interleave(masters):
    """Round-robin across masters so consecutive slots are different photographs.

    Master-by-master ordering would post the same image 8 times inside two days,
    which reads as spam and cannibalizes its own reach. Taking layout 1 of every
    master, then layout 2 of every master, spreads each master's pins ~1 per week
    across a 35-master run.
    """
    ordered = []
    depth = max((len(l) for _, _, l in masters), default=0)
    for i in range(depth):
        for slug, coll, layouts in masters:
            if i < len(layouts):
                ordered.append((slug, coll, layouts[i]))
    return ordered


def build_rows(ordered, copy_map, pins_root, start, link):
    rows, warnings = [], []
    for idx, (slug, coll, layout) in enumerate(ordered):
        c = copy_map[slug]
        day = start + timedelta(days=idx // len(DAILY_SLOTS))
        slot = DAILY_SLOTS[idx % len(DAILY_SLOTS)]
        board = c["board"] or BOARDS.get(coll, "")

        if not board:
            warnings.append(f"{slug}: no board — slug prefix isn't c1-c4 and no override given")
        if len(c["title"]) > TITLE_MAX:
            warnings.append(f"{slug}: title is {len(c['title'])} chars (max {TITLE_MAX})")
        if not (DESC_MIN <= len(c["desc"]) <= DESC_MAX):
            warnings.append(f"{slug}: desc is {len(c['desc'])} chars (want {DESC_MIN}-{DESC_MAX})")
        if "#" in c["desc"] or "#" in c["title"]:
            warnings.append(f"{slug}: contains a hashtag — page 22 doesn't use them")

        rel = f"{slug}/{layout}"
        rows.append({
            "date": day.isoformat(),
            "time": f"{slot} CT",
            "time_12h": to_12h(slot),
            "board": board,
            "image": rel,
            "path": os.path.join(pins_root, rel),
            "title": c["title"],
            "desc": c["desc"],
            "tags": c["tags"],
            "link": link,
        })

    # Same warning fires once per layout of a master; collapse to one line each.
    return rows, sorted(set(warnings))


def write_outputs(rows, out_path, load_size):
    base, ext = os.path.splitext(out_path)
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)

    loads = [rows[i:i + load_size] for i in range(0, len(rows), load_size)] or [[]]
    written = []

    for n, chunk in enumerate(loads, 1):
        csv_path = out_path if len(loads) == 1 else f"{base}-load{n}{ext}"
        with open(csv_path, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=FIELDS)
            w.writeheader()
            w.writerows(chunk)

        md_path = os.path.splitext(csv_path)[0] + ".md"
        with open(md_path, "w", encoding="utf-8") as fh:
            span = f"{chunk[0]['date']} → {chunk[-1]['date']}" if chunk else "empty"
            fh.write(f"# Pin Queue — load {n} of {len(loads)}\n\n")
            fh.write(f"{len(chunk)} pins · {span}\n\n")
            current = None
            for r in chunk:
                if r["date"] != current:
                    current = r["date"]
                    fh.write(f"\n## {current}\n\n")
                fh.write(f"- **{r['time']}** · {r['board']}\n")
                fh.write(f"  - `{r['image']}`\n")
                fh.write(f"  - {r['title']}\n")
                fh.write(f"  - {r['desc']}\n")

        written.append((csv_path, md_path, chunk))
    return written


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--pins-root", required=True, help="Path to 05_Social/Pins")
    p.add_argument("--copy", help="copy.csv with slug,title,desc,tags[,board]")
    p.add_argument("--start-date", help="First publish date, YYYY-MM-DD")
    p.add_argument("--out", help="Output CSV path under 05_Social/pin-queues/")
    p.add_argument("--link", default=DEFAULT_LINK)
    p.add_argument("--load-size", type=int, default=SCHEDULER_CAP)
    p.add_argument("--scan", action="store_true", help="Report masters and exit")
    args = p.parse_args()

    pins_root = os.path.abspath(os.path.expanduser(args.pins_root))
    masters = scan_masters(pins_root)
    if not masters:
        sys.exit(f"error: no master folders under {pins_root}")

    total = sum(len(l) for _, _, l in masters)

    if args.scan:
        print(f"{'slug':<52} {'coll':<6} layouts")
        print("-" * 72)
        for slug, coll, layouts in masters:
            print(f"{slug:<52} {coll or '??':<6} {len(layouts)}")
        print("-" * 72)
        print(f"{len(masters)} masters · {total} usable pins "
              f"(08_square and 09_long_pin excluded)")
        print(f"At {len(DAILY_SLOTS)}/day that is {total / len(DAILY_SLOTS):.0f} days "
              f"(~{total / len(DAILY_SLOTS) / 7:.1f} weeks), "
              f"{-(-total // args.load_size)} scheduler load(s).")
        unknown = [s for s, c, _ in masters if not c]
        if unknown:
            print(f"\nno collection prefix on: {', '.join(unknown)}")
        return

    for flag in ("copy", "start_date", "out"):
        if not getattr(args, flag):
            sys.exit(f"error: --{flag.replace('_', '-')} is required to build (use --scan to inventory)")

    try:
        start = datetime.strptime(args.start_date, "%Y-%m-%d").date()
    except ValueError:
        sys.exit("error: --start-date must be YYYY-MM-DD")
    if start < date.today():
        print(f"warning: --start-date {start} is in the past", file=sys.stderr)

    copy_map = load_copy(args.copy)

    # A master with no copy is dropped, not emitted blank — the scheduler is told to
    # stop on a missing title/desc, and dropping keeps the remaining slots contiguous.
    ready = [(s, c, l) for s, c, l in masters
             if copy_map.get(s, {}).get("title") and copy_map.get(s, {}).get("desc")]
    ready_slugs = {s for s, _, _ in ready}
    missing = [s for s, _, _ in masters if s not in ready_slugs]

    if not ready:
        sys.exit("error: no masters have both a title and a desc in the copy sheet")

    rows, warnings = build_rows(interleave(ready), copy_map, pins_root, start, args.link)
    written = write_outputs(rows, os.path.abspath(os.path.expanduser(args.out)), args.load_size)

    print(f"{len(rows)} pins from {len(ready)} masters "
          f"({rows[0]['date']} → {rows[-1]['date']})\n")
    for csv_path, md_path, chunk in written:
        print(f"  {csv_path}")
        print(f"  {md_path}")
        if chunk:
            print(f"    {len(chunk)} pins · {chunk[0]['date']} → {chunk[-1]['date']}\n")

    if missing:
        print(f"NEEDS_COPY — dropped {len(missing)} master(s) with no title/desc:", file=sys.stderr)
        for s in missing:
            print(f"  {s}", file=sys.stderr)
    if warnings:
        print(f"\n{len(warnings)} copy warning(s):", file=sys.stderr)
        for w in warnings:
            print(f"  {w}", file=sys.stderr)

    c2 = sorted({r["image"].split("/")[0] for r in rows if r["board"] == BOARDS["c2"]})
    if c2:
        print(f"\nC2 Scripture — {len(c2)} master(s) need verse sign-off before scheduling:",
              file=sys.stderr)
        for s in c2:
            print(f"  {s}", file=sys.stderr)


if __name__ == "__main__":
    main()
