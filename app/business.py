# Business Layer (Project 2)
from __future__ import annotations
from typing import Any, Optional
from app import dal

class NotFoundError(Exception): pass
class ValidationError(Exception): pass

class VulnVaultBusiness:

    def create_vendor(self,name:str,website:Optional[str])->dict:
        return dal.create_vendor(name,website)

    def get_vendor(self,vendor_id:int)->dict:
        row=dal.get_vendor(vendor_id)
        if row is None: raise NotFoundError("Vendor not found")
        return row

    def list_vendors(self)->list[dict]:
        return dal.list_vendors()

    def update_vendor_patch(self,vendor_id:int,patch:dict[str,Any])->dict:
        existing=dal.get_vendor(vendor_id)
        if existing is None: raise NotFoundError("Vendor not found")
        name=patch.get("name",existing["name"])
        website=patch.get("website",existing.get("website"))
        row=dal.update_vendor(vendor_id,name,website)
        if row is None: raise NotFoundError("Vendor not found")
        return row

    def delete_vendor(self,vendor_id:int)->bool:
        ok=dal.delete_vendor(vendor_id)
        if not ok: raise NotFoundError("Vendor not found")
        return ok
