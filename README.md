# Student Notebook & Project Submission Tracker

A Flask + SQLite web app for teachers to track notebook and project
submissions, built from a multi-sheet Excel workbook (one sheet per
class-section).

## What's included

- `app.py` — Flask backend (import parsing, APIs, exports)
- `templates/` — HTML pages (Home, Students, Dashboard)
- `static/` — CSS (blue/white theme) and JS (AJAX, Chart.js dashboards)
- `uploads/Students.xlsx` — your uploaded workbook, pre-loaded so you can
  import it immediately
- `requirements.txt`

## Setup

```bash
cd notebook_tracker
pip install -r requirements.txt
python app.py
```

Then open **http://localhost:5000** in your browser.

## First run

1. On the Home page, click **Import / Replace Excel**.
2. Select `uploads/Students.xlsx` (already included) or your own workbook.
3. Click **Upload & Import** — the app reads every sheet, detects the
   class and section from the sheet name (e.g. `"VI - Ravi"` →
   Class **VI**, Section **Ravi**), and stores all students in
   `tracker.db` (created automatically).
4. Pick a Class + Section from the Home page or the Students page to
   start marking notebook/project submissions. Every checkbox saves
   instantly via AJAX — no Save button needed.
5. Visit **Dashboard** for live charts and class/section summaries.
6. Use **Export Excel / CSV / PDF** any time to download a report.

## Deploying to Render

This project is ready to deploy as-is. It includes:

- `Procfile` — tells Render to run it with gunicorn
- `render.yaml` — optional infra-as-code blueprint (see below)
- `runtime.txt` — pins the Python version
- `requirements.txt` — includes `gunicorn`

### Option A: Manual setup (Web Service)

1. Push this folder to a GitHub repo.
2. On [render.com](https://render.com) → **New +** → **Web Service** → connect
   your repo.
3. Settings:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
4. Add an environment variable `FLASK_DEBUG` = `false`.
5. Click **Create Web Service**. Render builds and gives you a live URL
   (e.g. `https://notebook-tracker.onrender.com`).

### Option B: One-click blueprint

Push the repo, then in Render choose **New +** → **Blueprint** and point it
at this repo — it will read `render.yaml` and set everything up
automatically, including a 1 GB persistent disk mounted at `/var/data`
for the database and uploaded/exported files.

### ⚠️ Important: data persistence

SQLite writes to a file, so it needs disk storage that survives restarts:

- **Render Free plan**: does **not** support persistent disks. The
  filesystem resets on every redeploy and periodically on the free tier's
  spin-down/spin-up cycle — so `tracker.db` (and thus all submission
  data) can be wiped. Fine for a demo, but re-import the Excel file after
  any reset, and don't rely on it for real record-keeping.
- **Render Starter plan or higher**: supports a **Persistent Disk**
  (~$0.25/GB/month). Attach one at `/var/data` and set the `DATA_DIR`
  environment variable to `/var/data` (already wired into `render.yaml`
  and `app.py`) — then the database and files survive deploys and
  restarts.
- For anything beyond a classroom demo, consider swapping SQLite for a
  managed Postgres database (Render offers a free/low-cost Postgres
  add-on) — ask if you'd like help migrating.

## Notes on your workbook's format

Your file uses sheet names like `"VI - Ravi"` (Class **-** Section) and
each sheet has a title row, then a header row (`S.No.`, `Student Name`),
then the data. The importer automatically detects and skips the title
and header rows, and ignores the `Summary` sheet. One sheet
(`VI - Bhramaputra`) had no student list in the source file — it will
import with 0 students until you add names to it and re-import.

## Re-importing / updating the student list

Use the same **Import / Replace Excel** button any time. Check
**"Replace existing data"** if you want to wipe all records and reload
from scratch (this also resets all notebook/project statuses). Leave it
unchecked to add new students without touching existing ones (duplicates
are automatically skipped).
