from __future__ import annotations

import os
import json
from typing import Any, Optional

import requests

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")


def _pretty(x: Any) -> None:
    print(json.dumps(x, indent=2, default=str))


def _call(method: str, path: str, payload: Optional[dict] = None) -> Any:
    url = f"{API_BASE_URL}{path}"
    r = requests.request(method, url, json=payload, timeout=20)

    try:
        data = r.json()
    except Exception:
        data = r.text

    if r.status_code >= 400:
        print(f"\nERROR {r.status_code} calling {method} {path}")
        _pretty(data)
        raise SystemExit(1)

    return data


def demo_vendor_crud() -> None:
    print("\n--- DEMO: Vendor CRUD via Service Layer ---")

    # 1) Create
    created = _call("POST", "/vendors", {"name": "Project2 Demo Vendor", "website": "https://example.com"})
    print("\nCreated vendor:")
    _pretty(created)

    vendor_id = created.get("vendor_id")
    if vendor_id is None:
        print("\nService did not return vendor_id; cannot continue demo.")
        return

    # 2) Get
    fetched = _call("GET", f"/vendors/{vendor_id}")
    print("\nFetched vendor:")
    _pretty(fetched)

    # 3) Update (PATCH)
    updated = _call("PATCH", f"/vendors/{vendor_id}", {"website": "https://updated.example.com"})
    print("\nUpdated vendor:")
    _pretty(updated)

    # 4) List (prove it appears)
    vendors = _call("GET", "/vendors")
    print("\nAll vendors:")
    _pretty(vendors)

    # 5) Delete
    deleted = _call("DELETE", f"/vendors/{vendor_id}")
    print("\nDelete response:")
    _pretty(deleted)

    # 6) List again (prove removed)
    vendors2 = _call("GET", "/vendors")
    print("\nAll vendors after delete:")
    _pretty(vendors2)


def menu() -> None:
    while True:
        print("\n=== VulnVault Project 2 Console ===")
        print(f"API: {API_BASE_URL}")
        print("1) Health check")
        print("2) Demo Vendor CRUD (create/get/update/list/delete)")
        print("3) List vendors")
        print("4) List products")
        print("5) List vulnerabilities (latest 25)")
        print("6) List reports (latest 25)")
        print("0) Quit")

        choice = input("Choice: ").strip()

        if choice == "1":
            _pretty(_call("GET", "/health"))

        elif choice == "2":
            demo_vendor_crud()

        elif choice == "3":
            _pretty(_call("GET", "/vendors"))

        elif choice == "4":
            _pretty(_call("GET", "/products"))

        elif choice == "5":
            _pretty(_call("GET", "/vulnerabilities?limit=25"))

        elif choice == "6":
            _pretty(_call("GET", "/reports?limit=25"))

        elif choice == "0":
            break

        else:
            print("Invalid choice.")


if __name__ == "__main__":
    menu()