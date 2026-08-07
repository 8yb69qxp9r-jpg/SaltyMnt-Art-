# SMD Skills

Source of truth for Salty Mountain Digital's custom Claude skills. Files here are the
editable copies — the versions Claude actually loads live at the account level, so a
change here isn't live until it's installed.

## The Pinterest pipeline

Two skills, in order:

| Skill | Does | Produces / consumes |
|-------|------|---------------------|
| **`generate-pins`** (here) | Writes titles, descriptions, boards, dates, times | → `05_Social/pin-queues/*.csv` |
| **`smd-pinterest-scheduler`** (account) | Posts the queue into Pinterest's native scheduler | ← that CSV |

`generate-pins` never opens a browser. `smd-pinterest-scheduler` never writes copy. The
CSV is the whole contract between them — its columns are specified in the scheduler's
`references/queue-format.md`.

## Installing generate-pins

The scheduler is already installed on the account; this one is not. Install it the same
way the others got there (skill upload / skill-creator), after which it triggers on
phrases like "write this week's pins" or "build the pin queue" in any surface — chat,
Code, or Cowork.

## Running the builder standalone

The queue builder is plain Python 3, stdlib only, and works without Claude:

```bash
# What's on disk, and how long it will take to post
python3 generate-pins/scripts/build_queue.py \
  --pins-root "<SMD>/05_Social/Pins" --scan

# Build the queue (needs a copy.csv of slug,title,desc,tags)
python3 generate-pins/scripts/build_queue.py \
  --pins-root "<SMD>/05_Social/Pins" \
  --copy copy.csv \
  --start-date 2026-08-10 \
  --out "<SMD>/05_Social/pin-queues/week1-pin-queue.csv"
```

Replace `<SMD>` with the Salty Mountain Digital project folder.

Scan mode is safe to run any time — it only reads, and it answers "how many pins do I
actually have and how many scheduler loads is that?" in one line.
