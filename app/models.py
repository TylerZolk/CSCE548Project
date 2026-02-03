from dataclasses import dataclass
from typing import Optional
from datetime import date

@dataclass
class Vendor:
    vendor_id: Optional[int]
    name: str
    website: Optional[str]

@dataclass
class Product:
    product_id: Optional[int]
    vendor_id: int
    name: str
    version: str
    platform: str

@dataclass
class Vulnerability:
    vuln_id: Optional[int]
    product_id: int
    cve_id: Optional[str]
    title: str
    severity: str
    cvss: Optional[float]
    status: str
    disclosed_on: Optional[date]

@dataclass
class Report:
    report_id: Optional[int]
    vuln_id: int
    reporter: str
    source: str
    notes: Optional[str]
    is_verified: bool
