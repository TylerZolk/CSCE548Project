# FastAPI Service Layer — Complete (all 4 tables)
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.business import VulnVaultBusiness, NotFoundError

app = FastAPI(title="VulnVault API")

# ── CORS (required for browser clients) ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Lock down to your Vercel domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

biz = VulnVaultBusiness()


def _raise(e: Exception):
    if isinstance(e, NotFoundError):
        raise HTTPException(status_code=404, detail=str(e))
    raise HTTPException(status_code=500, detail=str(e))


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ── Vendors ───────────────────────────────────────────────────────────────────
class VendorIn(BaseModel):
    name: str
    website: Optional[str] = None

class VendorPatch(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None


@app.post("/vendors")
def create_vendor(payload: VendorIn):
    try: return biz.create_vendor(payload.name, payload.website)
    except Exception as e: _raise(e)

@app.get("/vendors")
def list_vendors():
    try: return biz.list_vendors()
    except Exception as e: _raise(e)

@app.get("/vendors/{vendor_id}")
def get_vendor(vendor_id: int):
    try: return biz.get_vendor(vendor_id)
    except Exception as e: _raise(e)

@app.patch("/vendors/{vendor_id}")
def update_vendor(vendor_id: int, payload: VendorPatch):
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    try: return biz.update_vendor_patch(vendor_id, patch)
    except Exception as e: _raise(e)

@app.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id: int):
    try: return {"deleted": biz.delete_vendor(vendor_id)}
    except Exception as e: _raise(e)


# ── Products ──────────────────────────────────────────────────────────────────
class ProductIn(BaseModel):
    vendor_id: int
    name: str
    version: str
    platform: str

class ProductPatch(BaseModel):
    vendor_id: Optional[int] = None
    name: Optional[str] = None
    version: Optional[str] = None
    platform: Optional[str] = None


@app.post("/products")
def create_product(payload: ProductIn):
    try: return biz.create_product(payload.vendor_id, payload.name, payload.version, payload.platform)
    except Exception as e: _raise(e)

@app.get("/products")
def list_products():
    try: return biz.list_products()
    except Exception as e: _raise(e)

@app.get("/products/{product_id}")
def get_product(product_id: int):
    try: return biz.get_product(product_id)
    except Exception as e: _raise(e)

@app.patch("/products/{product_id}")
def update_product(product_id: int, payload: ProductPatch):
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    try: return biz.update_product_patch(product_id, patch)
    except Exception as e: _raise(e)

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    try: return {"deleted": biz.delete_product(product_id)}
    except Exception as e: _raise(e)


# ── Vulnerabilities ───────────────────────────────────────────────────────────
class VulnIn(BaseModel):
    product_id: int
    cve_id: Optional[str] = None
    title: str
    severity: str
    cvss: Optional[float] = None
    status: str = "open"
    disclosed_on: Optional[str] = None

class VulnPatch(BaseModel):
    product_id: Optional[int] = None
    cve_id: Optional[str] = None
    title: Optional[str] = None
    severity: Optional[str] = None
    cvss: Optional[float] = None
    status: Optional[str] = None
    disclosed_on: Optional[str] = None


@app.post("/vulnerabilities")
def create_vulnerability(payload: VulnIn):
    try: return biz.create_vulnerability(
        payload.product_id, payload.cve_id, payload.title,
        payload.severity, payload.cvss, payload.status, payload.disclosed_on)
    except Exception as e: _raise(e)

@app.get("/vulnerabilities")
def list_vulnerabilities(limit: int = Query(default=25, ge=1, le=500)):
    try: return biz.list_vulnerabilities(limit)
    except Exception as e: _raise(e)

@app.get("/vulnerabilities/{vuln_id}")
def get_vulnerability(vuln_id: int):
    try: return biz.get_vulnerability(vuln_id)
    except Exception as e: _raise(e)

@app.patch("/vulnerabilities/{vuln_id}")
def update_vulnerability(vuln_id: int, payload: VulnPatch):
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    try: return biz.update_vulnerability_patch(vuln_id, patch)
    except Exception as e: _raise(e)

@app.delete("/vulnerabilities/{vuln_id}")
def delete_vulnerability(vuln_id: int):
    try: return {"deleted": biz.delete_vulnerability(vuln_id)}
    except Exception as e: _raise(e)


# ── Reports ───────────────────────────────────────────────────────────────────
class ReportIn(BaseModel):
    vuln_id: int
    reporter: str
    source: str
    notes: Optional[str] = None
    is_verified: bool = False

class ReportPatch(BaseModel):
    vuln_id: Optional[int] = None
    reporter: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    is_verified: Optional[bool] = None


@app.post("/reports")
def create_report(payload: ReportIn):
    try: return biz.create_report(
        payload.vuln_id, payload.reporter, payload.source,
        payload.notes, payload.is_verified)
    except Exception as e: _raise(e)

@app.get("/reports")
def list_reports(limit: int = Query(default=25, ge=1, le=500)):
    try: return biz.list_reports(limit)
    except Exception as e: _raise(e)

@app.get("/reports/{report_id}")
def get_report(report_id: int):
    try: return biz.get_report(report_id)
    except Exception as e: _raise(e)

@app.patch("/reports/{report_id}")
def update_report(report_id: int, payload: ReportPatch):
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    try: return biz.update_report_patch(report_id, patch)
    except Exception as e: _raise(e)

@app.delete("/reports/{report_id}")
def delete_report(report_id: int):
    try: return {"deleted": biz.delete_report(report_id)}
    except Exception as e: _raise(e)
