"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { api } from "@/lib/api";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: "", website: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.listVendors()
      .then(setVendors)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.website || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm({ name: "", website: "" }); setModal("create"); };
  const openEdit = (v: any) => { setSelected(v); setForm({ name: v.name, website: v.website || "" }); setModal("edit"); };
  const openDetail = (v: any) => { setSelected(v); setModal("detail"); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") {
        await api.createVendor({ name: form.name, website: form.website || undefined });
      } else {
        await api.updateVendor(selected.vendor_id, { name: form.name, website: form.website || undefined });
      }
      setModal(null);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      await api.deleteVendor(id);
      load();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Vendors</div>
          <div className="page-subtitle">// {vendors.length} registered vendors</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Vendor</button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-title">All Vendors</div>
          <input
            className="search-input"
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No vendors found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Website</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.vendor_id}>
                  <td className="mono" style={{ color: "var(--text3)" }}>#{v.vendor_id}</td>
                  <td className="text-bright" style={{ cursor: "pointer" }} onClick={() => openDetail(v)}>{v.name}</td>
                  <td>
                    {v.website ? (
                      <a href={v.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", fontSize: 12, fontFamily: "var(--mono)" }}>
                        {v.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : <span style={{ color: "var(--text3)" }}>—</span>}
                  </td>
                  <td className="mono" style={{ color: "var(--text3)" }}>
                    {new Date(v.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.vendor_id)}>Delete</button>
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
              <div className="modal-title">{modal === "create" ? "New Vendor" : "Edit Vendor"}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Vendor name" />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name}>
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
              <div className="modal-title">Vendor Details</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-key">ID</div><div className="detail-val">#{selected.vendor_id}</div></div>
                <div className="detail-item"><div className="detail-key">Created</div><div className="detail-val">{new Date(selected.created_at).toLocaleDateString()}</div></div>
                <div className="detail-item" style={{ gridColumn: "1/-1" }}><div className="detail-key">Name</div><div className="detail-val">{selected.name}</div></div>
                <div className="detail-item" style={{ gridColumn: "1/-1" }}><div className="detail-key">Website</div><div className="detail-val">{selected.website || "—"}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setModal(null); setTimeout(() => openEdit(selected), 50); }}>Edit</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
