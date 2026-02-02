# Stage 2: BMHOME XML catalog sync

This project syncs BMHOME products from the official Ticimax XML feed and updates PostgreSQL via Prisma.

## Manual run (local)

1) Install dependencies:

```bash
npm ci
```

2) Ensure `DATABASE_URL` is available (Prisma loads `.env` from the project root).

3) Parse-only (fast smoke check, no DB writes):

```bash
npm run sync:bmhome -- --parse-only --limit=10
```

4) Dry-run (no DB writes, full parsing):

```bash
npm run sync:bmhome -- --dry-run --limit=50
```

5) Real update:

```bash
npm run sync:bmhome
```

Reports are created under `sync_reports/YYYY-MM-DD_HHMMSS/`.

## Admin panel

Use `/admin/bmhome-sync` to:

- Update feed URL and USD → EUR rate
- Trigger sync
- Review status and recent runs
- Open reports/logs

## Configuration (env)

The script reads these variables from `.env` or the environment:

- `DATABASE_URL` (required)
- `BMHOME_FEED_URL` (default: official Ticimax XML URL)
- `BMHOME_USD_TO_EUR_RATE` (default: `1`)
- `SYNC_REPORT_DIR` (default: `./sync_reports`)

## Reports and logs

Each run creates:

- `report.json`
- `report.md`
- `errors.jsonl`
- `run.log`

All reports are stored under `sync_reports/YYYY-MM-DD_HHMMSS/`.

## Scheduling on server (systemd)

1) Copy unit files:

```bash
sudo cp deploy/systemd/* /etc/systemd/system/
```

2) Reload systemd:

```bash
sudo systemctl daemon-reload
```

3) Enable the timer:

```bash
sudo systemctl enable --now carpet-store-bmhome-sync.timer
```

4) Check status:

```bash
sudo systemctl list-timers | grep carpet-store
```

5) View logs:

```bash
sudo journalctl -u carpet-store-bmhome-sync.service -n 200 --no-pager
```

Manual run on server:

```bash
cd /var/www/carpet-store
/usr/bin/npm run sync:bmhome
```

## Acceptance checklist

- `npm ci` succeeds
- `npm run build` succeeds
- `npm run sync:bmhome -- --parse-only --limit=10` produces a report with non-zero counts
- `npm run sync:bmhome` updates/creates BMHOME products in DB
- Products missing from the feed are deactivated (price cleared)
- AUTO mode shows DEFAULT if BMHOME count is below `autoFallbackMinCount`
