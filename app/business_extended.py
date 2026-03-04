# Business Layer — Complete (all 4 tables)
from __future__ import annotations
from typing import Any, Optional
from app import dal

class NotFoundError(Exception): pass
class ValidationError(Exception): pass


class VulnVaultBusiness:

    # ── Vendors ────────────────────────────────────────────────────────────────
    def create_vendor(self, name: str, website: Optional[str]) -> dict:
        return dal.create_vendor(name, website)

    def get_vendor(self, vendor_id: int) -> dict:
        row = dal.get_vendor(vendor_id)
        if row is None: raise NotFoundError("Vendor not found")
        return row

    def list_vendors(self) -> list[dict]:
        return dal.list_vendors()

    def update_vendor_patch(self, vendor_id: int, patch: dict[str, Any]) -> dict:
        existing = dal.get_vendor(vendor_id)
        if existing is None: raise NotFoundError("Vendor not found")
        name = patch.get("name", existing["name"])
        website = patch.get("website", existing.get("website"))
        row = dal.update_vendor(vendor_id, name, website)
        if row is None: raise NotFoundError("Vendor not found")
        return row

    def delete_vendor(self, vendor_id: int) -> bool:
        ok = dal.delete_vendor(vendor_id)
        if not ok: raise NotFoundError("Vendor not found")
        return ok

    # ── Products ───────────────────────────────────────────────────────────────
    def create_product(self, vendor_id: int, name: str, version: str, platform: str) -> dict:
        return dal.create_product(vendor_id, name, version, platform)

    def get_product(self, product_id: int) -> dict:
        row = dal.get_product(product_id)
        if row is None: raise NotFoundError("Product not found")
        return row

    def list_products(self) -> list[dict]:
        return dal.list_products()

    def update_product_patch(self, product_id: int, patch: dict[str, Any]) -> dict:
        existing = dal.get_product(product_id)
        if existing is None: raise NotFoundError("Product not found")
        row = dal.update_product(
            product_id,
            patch.get("vendor_id", existing["vendor_id"]),
            patch.get("name", existing["name"]),
            patch.get("version", existing["version"]),
            patch.get("platform", existing["platform"]),
        )
        if row is None: raise NotFoundError("Product not found")
        return row

    def delete_product(self, product_id: int) -> bool:
        ok = dal.delete_product(product_id)
        if not ok: raise NotFoundError("Product not found")
        return ok

    # ── Vulnerabilities ────────────────────────────────────────────────────────
    def create_vulnerability(self, product_id: int, cve_id: Optional[str], title: str,
                              severity: str, cvss: Optional[float], status: str,
                              disclosed_on: Optional[str]) -> dict:
        return dal.create_vulnerability(product_id, cve_id, title, severity, cvss, status, disclosed_on)

    def get_vulnerability(self, vuln_id: int) -> dict:
        row = dal.get_vulnerability(vuln_id)
        if row is None: raise NotFoundError("Vulnerability not found")
        return row

    def list_vulnerabilities(self, limit: int = 25) -> list[dict]:
        return dal.list_vulnerabilities(limit)

    def update_vulnerability_patch(self, vuln_id: int, patch: dict[str, Any]) -> dict:
        existing = dal.get_vulnerability(vuln_id)
        if existing is None: raise NotFoundError("Vulnerability not found")
        row = dal.update_vulnerability(
            vuln_id,
            patch.get("product_id", existing["product_id"]),
            patch.get("cve_id", existing.get("cve_id")),
            patch.get("title", existing["title"]),
            patch.get("severity", existing["severity"]),
            patch.get("cvss", existing.get("cvss")),
            patch.get("status", existing["status"]),
            patch.get("disclosed_on", existing.get("disclosed_on")),
        )
        if row is None: raise NotFoundError("Vulnerability not found")
        return row

    def delete_vulnerability(self, vuln_id: int) -> bool:
        ok = dal.delete_vulnerability(vuln_id)
        if not ok: raise NotFoundError("Vulnerability not found")
        return ok

    # ── Reports ────────────────────────────────────────────────────────────────
    def create_report(self, vuln_id: int, reporter: str, source: str,
                      notes: Optional[str], is_verified: bool) -> dict:
        return dal.create_report(vuln_id, reporter, source, notes, is_verified)

    def get_report(self, report_id: int) -> dict:
        row = dal.get_report(report_id)
        if row is None: raise NotFoundError("Report not found")
        return row

    def list_reports(self, limit: int = 25) -> list[dict]:
        return dal.list_reports(limit)

    def update_report_patch(self, report_id: int, patch: dict[str, Any]) -> dict:
        existing = dal.get_report(report_id)
        if existing is None: raise NotFoundError("Report not found")
        row = dal.update_report(
            report_id,
            patch.get("vuln_id", existing["vuln_id"]),
            patch.get("reporter", existing["reporter"]),
            patch.get("source", existing["source"]),
            patch.get("notes", existing.get("notes")),
            patch.get("is_verified", existing["is_verified"]),
        )
        if row is None: raise NotFoundError("Report not found")
        return row

    def delete_report(self, report_id: int) -> bool:
        ok = dal.delete_report(report_id)
        if not ok: raise NotFoundError("Report not found")
        return ok
