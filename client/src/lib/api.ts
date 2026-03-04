const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

export const api = {
  // Health
  health: () => apiFetch("/health"),

  // Vendors
  listVendors: () => apiFetch("/vendors"),
  getVendor: (id: number) => apiFetch(`/vendors/${id}`),
  createVendor: (data: { name: string; website?: string }) =>
    apiFetch("/vendors", { method: "POST", body: JSON.stringify(data) }),
  updateVendor: (id: number, data: { name?: string; website?: string }) =>
    apiFetch(`/vendors/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteVendor: (id: number) =>
    apiFetch(`/vendors/${id}`, { method: "DELETE" }),

  // Products
  listProducts: () => apiFetch("/products"),
  getProduct: (id: number) => apiFetch(`/products/${id}`),
  createProduct: (data: { vendor_id: number; name: string; version: string; platform: string }) =>
    apiFetch("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<{ vendor_id: number; name: string; version: string; platform: string }>) =>
    apiFetch(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    apiFetch(`/products/${id}`, { method: "DELETE" }),

  // Vulnerabilities
  listVulnerabilities: (limit = 25) => apiFetch(`/vulnerabilities?limit=${limit}`),
  getVulnerability: (id: number) => apiFetch(`/vulnerabilities/${id}`),
  createVulnerability: (data: object) =>
    apiFetch("/vulnerabilities", { method: "POST", body: JSON.stringify(data) }),
  updateVulnerability: (id: number, data: object) =>
    apiFetch(`/vulnerabilities/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteVulnerability: (id: number) =>
    apiFetch(`/vulnerabilities/${id}`, { method: "DELETE" }),

  // Reports
  listReports: (limit = 25) => apiFetch(`/reports?limit=${limit}`),
  getReport: (id: number) => apiFetch(`/reports/${id}`),
  createReport: (data: object) =>
    apiFetch("/reports", { method: "POST", body: JSON.stringify(data) }),
  updateReport: (id: number, data: object) =>
    apiFetch(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteReport: (id: number) =>
    apiFetch(`/reports/${id}`, { method: "DELETE" }),
};
