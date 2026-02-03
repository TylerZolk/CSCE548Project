from typing import Any, Optional
from app.db import get_conn

# --- Helper ---
def _fetchone(cur) -> Optional[dict]:
    row = cur.fetchone()
    return dict(row) if row else None

def _fetchall(cur) -> list[dict]:
    return [dict(r) for r in cur.fetchall()]

# --- Vendors CRUD ---
def create_vendor(name: str, website: Optional[str]) -> dict:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO vendors (name, website) VALUES (%s, %s) RETURNING *;",
            (name, website),
        )
        return _fetchone(cur)

def get_vendor(vendor_id: int) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM vendors WHERE vendor_id=%s;", (vendor_id,))
        return _fetchone(cur)

def list_vendors() -> list[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM vendors ORDER BY vendor_id;")
        return _fetchall(cur)

def update_vendor(vendor_id: int, name: str, website: Optional[str]) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            UPDATE vendors
            SET name=%s, website=%s
            WHERE vendor_id=%s
            RETURNING *;
            """,
            (name, website, vendor_id),
        )
        return _fetchone(cur)

def delete_vendor(vendor_id: int) -> bool:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM vendors WHERE vendor_id=%s;", (vendor_id,))
        return cur.rowcount == 1

# --- Products CRUD ---
def create_product(vendor_id: int, name: str, version: str, platform: str) -> dict:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO products (vendor_id, name, version, platform)
            VALUES (%s, %s, %s, %s)
            RETURNING *;
            """,
            (vendor_id, name, version, platform),
        )
        return _fetchone(cur)

def get_product(product_id: int) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM products WHERE product_id=%s;", (product_id,))
        return _fetchone(cur)

def list_products() -> list[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT p.*, v.name AS vendor_name
            FROM products p
            JOIN vendors v ON v.vendor_id = p.vendor_id
            ORDER BY p.product_id;
            """
        )
        return _fetchall(cur)

def update_product(product_id: int, vendor_id: int, name: str, version: str, platform: str) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            UPDATE products
            SET vendor_id=%s, name=%s, version=%s, platform=%s
            WHERE product_id=%s
            RETURNING *;
            """,
            (vendor_id, name, version, platform, product_id),
        )
        return _fetchone(cur)

def delete_product(product_id: int) -> bool:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM products WHERE product_id=%s;", (product_id,))
        return cur.rowcount == 1

# --- Vulnerabilities CRUD ---
def create_vulnerability(product_id: int, cve_id: Optional[str], title: str, severity: str,
                         cvss: Optional[float], status: str, disclosed_on: Optional[str]) -> dict:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO vulnerabilities (product_id, cve_id, title, severity, cvss, status, disclosed_on)
            VALUES (%s, %s, %s, %s, %s, %s, %s::date)
            RETURNING *;
            """,
            (product_id, cve_id, title, severity, cvss, status, disclosed_on),
        )
        return _fetchone(cur)

def get_vulnerability(vuln_id: int) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM vulnerabilities WHERE vuln_id=%s;", (vuln_id,))
        return _fetchone(cur)

def list_vulnerabilities(limit: int = 25) -> list[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT v.*, p.name AS product_name, p.version, p.platform
            FROM vulnerabilities v
            JOIN products p ON p.product_id = v.product_id
            ORDER BY v.vuln_id DESC
            LIMIT %s;
            """,
            (limit,),
        )
        return _fetchall(cur)

def update_vulnerability(vuln_id: int, product_id: int, cve_id: Optional[str], title: str, severity: str,
                         cvss: Optional[float], status: str, disclosed_on: Optional[str]) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            UPDATE vulnerabilities
            SET product_id=%s, cve_id=%s, title=%s, severity=%s, cvss=%s, status=%s, disclosed_on=%s::date
            WHERE vuln_id=%s
            RETURNING *;
            """,
            (product_id, cve_id, title, severity, cvss, status, disclosed_on, vuln_id),
        )
        return _fetchone(cur)

def delete_vulnerability(vuln_id: int) -> bool:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM vulnerabilities WHERE vuln_id=%s;", (vuln_id,))
        return cur.rowcount == 1

# --- Reports CRUD ---
def create_report(vuln_id: int, reporter: str, source: str, notes: Optional[str], is_verified: bool) -> dict:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO reports (vuln_id, reporter, source, notes, is_verified)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (vuln_id, reporter, source, notes, is_verified),
        )
        return _fetchone(cur)

def get_report(report_id: int) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM reports WHERE report_id=%s;", (report_id,))
        return _fetchone(cur)

def list_reports(limit: int = 25) -> list[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT r.*, v.cve_id, v.title
            FROM reports r
            JOIN vulnerabilities v ON v.vuln_id = r.vuln_id
            ORDER BY r.reported_on DESC
            LIMIT %s;
            """,
            (limit,),
        )
        return _fetchall(cur)

def update_report(report_id: int, vuln_id: int, reporter: str, source: str, notes: Optional[str], is_verified: bool) -> Optional[dict]:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            UPDATE reports
            SET vuln_id=%s, reporter=%s, source=%s, notes=%s, is_verified=%s
            WHERE report_id=%s
            RETURNING *;
            """,
            (vuln_id, reporter, source, notes, is_verified, report_id),
        )
        return _fetchone(cur)

def delete_report(report_id: int) -> bool:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM reports WHERE report_id=%s;", (report_id,))
        return cur.rowcount == 1
