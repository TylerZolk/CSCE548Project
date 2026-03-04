"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { api } from "@/lib/api";

const PLATFORMS = ["windows", "linux", "mac", "web", "mobile", "cloud", "iot"];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ vendor_id: "", name: "", version: "", platform: "web" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.listProducts(), api.listVendors()])
      .then(([p, v]) => { setProducts(p); setVendors(v); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.platform.toLowerCase().includes(search.toLowerCase()) ||
    p.version.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm({ vendor_id: vendors[0]?.vendor_id?.toString() || "", name: "", version: "", platform: "web" }); setModal("create"); };
  const openEdit = (p: any) => { setSelected(p); setForm({ vendor_id: p.vendor_id.toString(), name: p.name, version: p.version, platform: p.platform }); setModal("edit"); };
  const openDetail = (p: any) => { setSelected(p); setModal("detail"); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { vendor_id: Number(form.vendor_id), name: form.name, version: form.version, platform: form.platform };
      if (modal === "create") await api.createProduct(data);
      else await api.updateProduct(selected.product_id, data);
      setModal(null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try { await api.deleteProduct(id); load(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">// {products.length} tracked products</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Product</button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-title">All Products</div>
          <input className="search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No products found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Version</th>
                <th>Platform</th>
                <th>Vendor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.product_id}>
                  <td className="mono" style={{ color: "var(--text3)" }}>#{p.product_id}</td>
                  <td className="text-bright" style={{ cursor: "pointer" }} onClick={() => openDetail(p)}>{p.name}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{p.version}</td>
                  <td><span className="chip">{p.platform}</span></td>
                  <td style={{ color: "var(--text2)" }}>{p.vendor_name}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.product_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === "create" ? "New Product" : "Edit Product"}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Vendor *</label>
                <select className="form-select" value={form.vendor_id} onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))}>
                  {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
              </div>
              <div className="form-group">
                <label className="form-label">Version *</label>
                <input className="form-input" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="e.g. 1.0.0" />
              </div>
              <div className="form-group">
                <label className="form-label">Platform *</label>
                <select className="form-select" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.version}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "detail" && selected && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Product Details</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-key">ID</div><div className="detail-val">#{selected.product_id}</div></div>
                <div className="detail-item"><div className="detail-key">Platform</div><div className="detail-val">{selected.platform}</div></div>
                <div className="detail-item"><div className="detail-key">Name</div><div className="detail-val">{selected.name}</div></div>
                <div className="detail-item"><div className="detail-key">Version</div><div className="detail-val">{selected.version}</div></div>
                <div className="detail-item" style={{ gridColumn: "1/-1" }}><div className="detail-key">Vendor</div><div className="detail-val">{selected.vendor_name}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
