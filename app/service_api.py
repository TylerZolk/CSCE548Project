# FastAPI Service Layer (Project 2)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.business import VulnVaultBusiness, NotFoundError

app=FastAPI(title="VulnVault API")
biz=VulnVaultBusiness()

class VendorIn(BaseModel):
    name:str
    website:Optional[str]=None

class VendorPatch(BaseModel):
    name:Optional[str]=None
    website:Optional[str]=None

def _raise(e):
    if isinstance(e,NotFoundError):
        raise HTTPException(status_code=404,detail=str(e))
    raise HTTPException(status_code=500,detail=str(e))

@app.get("/health")
def health(): return {"status":"ok"}

@app.post("/vendors")
def create_vendor(payload:VendorIn):
    try: return biz.create_vendor(payload.name,payload.website)
    except Exception as e: _raise(e)

@app.get("/vendors/{vendor_id}")
def get_vendor(vendor_id:int):
    try: return biz.get_vendor(vendor_id)
    except Exception as e: _raise(e)

@app.get("/vendors")
def list_vendors():
    try: return biz.list_vendors()
    except Exception as e: _raise(e)

@app.patch("/vendors/{vendor_id}")
def update_vendor(vendor_id:int,payload:VendorPatch):
    try: return biz.update_vendor_patch(vendor_id,{k:v for k,v in payload.model_dump().items() if v is not None})
    except Exception as e: _raise(e)

@app.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id:int):
    try: return {"deleted":biz.delete_vendor(vendor_id)}
    except Exception as e: _raise(e)
