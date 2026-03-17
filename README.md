# ◈ VulnVault

**Vulnerability Management System** — CSCE 548 Project 4

A full-stack, four-tier web application for tracking software vulnerabilities, affected products, vendors, and security reports.

---

## Live Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| Front End | Vercel | `https://csce548project.vercel.app` |
| API / Service Layer | Railway | `https://csce548project-production.up.railway.app` |
| API Docs (Swagger) | Railway | `https://csce548project-production.up.railway.app/docs` |
| Database | Railway PostgreSQL | (internal) |

---

## Architecture

```
Browser (Next.js / Vercel)
        │  HTTPS / REST+JSON
        ▼
FastAPI Service Layer (Railway)
        │  Python function calls
        ▼
Business Layer (business.py)
        │  Python function calls
        ▼
Data Access Layer (dal.py / psycopg2)
        │  SQL
        ▼
PostgreSQL Database (Railway)
```

**Tech stack:** Next.js 14 · React 18 · TypeScript · FastAPI · Python 3 · PostgreSQL · psycopg2

---

## Features

- **Vendors** — CRUD for software vendors (name, website)
- **Products** — CRUD for products linked to vendors (name, version, platform)
- **Vulnerabilities** — Full lifecycle tracking (CVE ID, severity, CVSS score, status, disclosure date)
- **Reports** — Submission tracking per vulnerability (reporter, source, verification status)
- **Dashboard** — Live counts, severity/status bar charts, recent vulnerability feed
- **Filtering & Search** — Search and filter on Vulnerabilities and Reports pages
- **Auto-linked CVEs** — CVE IDs link directly to NVD (nvd.nist.gov)
- **Responsive design** — Dark-mode terminal aesthetic with Space Mono / DM Sans fonts

---

## Quick Start (Local)

### Prerequisites

- Python 3.10+
- Node.js 18.17+
- A PostgreSQL database (local or Railway)

### 1. Clone

```bash
git clone https://github.com/<your-username>/CSCE548Project.git
cd CSCE548Project
```

### 2. Set Up the Database

Connect to your PostgreSQL instance and run the SQL scripts in order:

```bash
psql "$DATABASE_URL" -f sql/01_create_schema.sql
psql "$DATABASE_URL" -f sql/02_seed_data.sql
```

### 3. Run the Back End

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:pass@host:port/dbname"
uvicorn app.service_api_extended:app --reload --port 8000
```

Visit `http://localhost:8000/health` — should return `{"status":"ok"}`.

### 4. Run the Front End

```bash
cd client
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
```

Open `http://localhost:3000`.

---

## Deployment

Full step-by-step deployment instructions are in the **`VulnVault_Deployment_SystemTest.pdf`** file at the root of this repository. It covers:

- Railway PostgreSQL setup
- Railway FastAPI service deployment
- Vercel Next.js deployment
- Environment variable configuration
- System test results for all four entities (Vendors, Products, Vulnerabilities, Reports)

### Key Environment Variables

| Variable | Where Set | Value |
|----------|-----------|-------|
| `DATABASE_URL` | Railway service | `postgresql://...` connection string |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel | Railway service public URL |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET/POST | `/vendors` | List or create vendors |
| GET/PATCH/DELETE | `/vendors/{id}` | Read, update, or delete a vendor |
| GET/POST | `/products` | List or create products |
| GET/PATCH/DELETE | `/products/{id}` | Read, update, or delete a product |
| GET/POST | `/vulnerabilities?limit=N` | List or create vulnerabilities |
| GET/PATCH/DELETE | `/vulnerabilities/{id}` | Read, update, or delete a vulnerability |
| GET/POST | `/reports?limit=N` | List or create reports |
| GET/PATCH/DELETE | `/reports/{id}` | Read, update, or delete a report |

Interactive docs: `<api-url>/docs`

---

## Project Structure

```
CSCE548Project/
├── app/
│   ├── __init__.py
│   ├── db.py                      # DB connection
│   ├── dal.py                     # Data Access Layer
│   ├── business.py                # Business Layer
│   └── service_api_extended.py    # FastAPI Service Layer
├── client/
│   ├── src/
│   │   ├── app/                   # Next.js pages
│   │   ├── components/            # Sidebar, AppLayout
│   │   └── lib/api.ts             # Front-end API client
│   ├── package.json
│   └── tsconfig.json
├── sql/
│   ├── 01_create_schema.sql       # DDL
│   └── 02_seed_data.sql           # Sample data
├── main.py                        # CLI console for quick testing
├── requirements.txt               # Python deps
├── Procfile                       # Railway start command
└── VulnVault_Deployment_SystemTest.pdf   # Full deployment + test doc
```

---

## Data Model

```
vendors (vendor_id, name, website, created_at)
    │
    └── products (product_id, vendor_id, name, version, platform, created_at)
            │
            └── vulnerabilities (vuln_id, product_id, cve_id, title, severity, cvss,
            │                    status, disclosed_on, created_at)
            │
            └── reports (report_id, vuln_id, reporter, source, notes,
                         reported_on, is_verified)
```

---

## Screenshots

Screenshots of the full system test (create/read/update/delete for all four entities, with database verification) are included in the `VulnVault_Deployment_SystemTest.pdf` deployment document.

---

## Course

**CSCE 548** — Software Development with Generative AI  
Project 4 — Full System Test & Deployment Documentation
