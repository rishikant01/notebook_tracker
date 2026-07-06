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
