# Stage 2: BMHOME catalog sync

This project includes a standalone sync tool that crawls bmhome.com.tr and updates product
data in PostgreSQL via Prisma. The sync is designed to run weekly and can be executed manually.

## Manual run (local)

1) Install dependencies:

```bash
npm ci
```

2) Ensure DATABASE_URL is available (Prisma loads .env from the project root).

3) Run a dry run:

```bash
npm run sync:bmhome -- --dry-run --limit=20
```

4) Run a real update:

```bash
npm run sync:bmhome -- --limit=20
```

Reports are created under `sync_reports/YYYY-MM-DD_HHMMSS/`.

## Admin panel

Use `/admin/bmhome-sync` to check status, trigger sync, open the browser window,
and review recent runs.

## Configuration (env)

The script reads these variables from `.env` or the environment:

- `DATABASE_URL` (required)
- `BMHOME_BASE_URL` (default `https://www.bmhome.com.tr`)
- `BMHOME_START_URLS` (comma-separated list of listing URLs)
- `BMHOME_USE_PLAYWRIGHT` (default `1`)
- `BMHOME_USER_DATA_DIR` (default `./.bmhome_profile`)
- `BMHOME_MAX_CONCURRENCY` (default `4`)
- `BMHOME_RATE_LIMIT_MS` (default `300`)
- `SYNC_REPORT_DIR` (default `./sync_reports`)

Example for `BMHOME_START_URLS`:

```
https://www.bmhome.com.tr/tum-halilar,https://www.bmhome.com.tr/yeni-halilar,https://www.bmhome.com.tr/yolluklar
```

Note: if `BMHOME_START_URLS` is empty, the script uses the same default set of category paths.

If you enable `BMHOME_USE_PLAYWRIGHT=1`, ensure `playwright` is installed in the project.
The Playwright sync uses a persistent profile at `BMHOME_USER_DATA_DIR` so you can pass challenges
via the admin browser window (`/admin/bmhome-browser/`).

Install Playwright (server or local) if needed:

```bash
npm i playwright
npx playwright install --with-deps
```

Recommended server path for the profile:

```
/var/www/carpet-store/.bmhome_profile
```

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

Or via systemd:

```bash
sudo systemctl start carpet-store-bmhome-sync.service
```

## Browser for manual verification (noVNC)

The repository includes a Chromium noVNC container. Nginx proxies it at:

- `/admin/bmhome-browser/` (protected via BasicAuth in `nginx.conf`)

Create a password file on the server, for example:

```bash
sudo apt-get install -y apache2-utils
sudo htpasswd -c /etc/nginx/.bmhome_htpasswd admin
sudo systemctl reload nginx
```

## Scheduling on server (cron, optional)

Use `deploy/cron/carpet-store-bmhome-sync.cron` as a template.

## Reports and logs

Each run creates:

- `report.json`
- `report.md`
- `errors.jsonl`
- `run.log`

All reports are stored under `sync_reports/YYYY-MM-DD_HHMMSS/`.

## When bmhome changes layout

Update selectors and parsing here:

- `scripts/bmhome/lib/extract.ts` (product links, price, images, sizes, stock)
- `scripts/bmhome/lib/normalize.ts` (price normalization)

Run a dry run after changes to confirm the counts and report output.

## Acceptance checklist

- `npm ci` succeeds
- `npm run build` succeeds
- `npm run sync:bmhome -- --dry-run --limit=20` creates `report.md` with non-zero counts
- `npm run sync:bmhome -- --limit=20` updates/creates products in DB
- Products with price 0 or missing price are not shown in the catalog
- В админке `/admin/bmhome-sync` можно переключать режим каталога и видеть результат на витрине
- AUTO режим показывает дефолтные товары, если BMHOME товаров меньше `autoFallbackMinCount`
- Текущий курс EUR → RUB отображается в админке
- `systemctl list-timers` shows the timer, and `journalctl` shows recent sync logs
