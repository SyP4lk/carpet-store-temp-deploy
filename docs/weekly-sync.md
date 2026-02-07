# Weekly BMHOME sync

This project already includes systemd units and a cron example for weekly sync.

## Option 1: systemd timer

1. Copy unit files:

```bash
sudo cp deploy/systemd/* /etc/systemd/system/
```

2. Reload and enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now carpet-store-bmhome-sync.timer
```

3. Check status:

```bash
sudo systemctl list-timers | grep carpet-store
```

## Option 2: cron

Use the example in `deploy/cron/carpet-store-bmhome-sync.cron` and add it to the server crontab.
