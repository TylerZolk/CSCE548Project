"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { api } from "@/lib/api";

const SEVERITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["open", "triage", "fixed", "wontfix"];

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterSev, setFilterSev] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [limit, setLimit] = useState(25);
  const [modal, setModal] = useState<"create" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ product_id: "", cve_id: "", title: "", severity: "medium", cvss: "", status: "open", disclosed_on: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.listVulnerabilities(limit), api.listProducts()])
      .then(([v, p]) => { setVulns(v); setProducts(p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [limit]);

  const filtered = vulns.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.cve_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.product_name || "").toLowerCase().includes(search.toLowerCase());
    const matchSev = filterSev === "all" || v.severity === filterSev;
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    return matchSearch && matchSev && matchStatus;
  });

  const openCreate = () => {
    setForm({ product_id: products[0]?.product_id?.toString() || "", cve_id: "", title: "", severity: "medium", cvss: "", status: "open", disclosed_on: "" });
    setModal("create");
  };
  const openEdit = (v: any) => {
    setSelected(v);
    setForm({ product_id: v.product_id.toString(), cve_id: v.cve_id || "", title: v.title, severity: v.severity, cvss: v.cvss?.toString() || "", status: v.status, disclosed_on: v.disclosed_on || "" });
    setModal("edit");
  };
  const openDetail = (v: any) => { setSelected(v); setModal("detail"); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        product_id: Number(form.product_id),
        cve_id: form.cve_id || null,
        title: form.title,
        severity: form.severity,
        cvss: form.cvss ? Number(form.cvss) : null,
        status: form.status,
        disclosed_on: form.disclosed_on || null,
      };
      if (modal === "create") await api.createVulnerability(data);
      else await api.updateVulnerability(selected.vuln_id, data);
      setModal(null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vulnerability?")) return;
    try { await api.deleteVulnerability(id); load(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Vulnerabilities</div>
          <div className="page-subtitle">// showing {filtered.length} of {vulns.length} records</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Vulnerability</button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="search-input" style={{ width: 240 }} placeholder="Search CVE, title, product..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: "auto" }} value={filterSev} onChange={e => setFilterSev(e.target.value)}>
          <option value="all">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: "auto" }} value={limit} onChange={e => { setLimit(Number(e.target.value)); }}>
          <option value={25}>Last 25</option>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
        </select>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-title">Vulnerabilities</div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>{filtered.length} results</span>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No vulnerabilities found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>CVE</th>
                <th>Title</th>
                <th>Product</th>
                <th>Severity</th>
                <th>CVSS</th>
                <th>Status</th>
                <th>Disclosed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.vuln_id}>
                  <td>
                    {v.cve_id ? (
                      <a className="cve" href={`https://nvd.nist.gov/vuln/detail/${v.cve_id}`} target="_blank" rel="noopener noreferrer">{v.cve_id}</a>
                    ) : <span style={{ color: "var(--text3)", fontSize: 11 }}>N/A</span>}
                  </td>
                  <td className="text-bright" style={{ cursor: "pointer", maxWidth: 240 }} onClick={() => openDetail(v)}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</span>
                  </td>
                  <td><span className="chip">{v.product_name}</span></td>
                  <td><span className={`badge badge-${v.severity}`}>{v.severity}</span></td>
                  <td className="mono" style={{ fontSize: 12 }}>{v.cvss ?? "—"}</td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  <td className="mono" style={{ fontSize: 11, color: "var(--text3)" }}>{v.disclosed_on || "—"}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.vuln_id)}>Del</button>
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
              <div className="modal-title">{modal === "create" ? "New Vulnerability" : "Edit Vulnerability"}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product *</label>
                <select className="form-select" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
                  {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name} {p.version} ({p.vendor_name})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CVE ID</label>
                <input className="form-input" value={form.cve_id} onChange={e => setForm(f => ({ ...f, cve_id: e.target.value }))} placeholder="CVE-2025-12345" />
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Vulnerability title" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Severity *</label>
                  <select className="form-select" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">CVSS Score</label>
                  <input className="form-input" type="number" min="0" max="10" step="0.1" value={form.cvss} onChange={e => setForm(f => ({ ...f, cvss: e.target.value }))} placeholder="0.0 – 10.0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Disclosed On</label>
                  <input className="form-input" type="date" value={form.disclosed_on} onChange={e => setForm(f => ({ ...f, disclosed_on: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title}>
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
              <div className="modal-title">Vulnerability Details</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-key">Vuln ID</div><div className="detail-val">#{selected.vuln_id}</div></div>
                <div className="detail-item"><div className="detail-key">CVE</div>
                  <div className="detail-val">
                    {selected.cve_id ? <a className="cve" href={`https://nvd.nist.gov/vuln/detail/${selected.cve_id}`} target="_blank" rel="noopener noreferrer">{selected.cve_id}</a> : "—"}
                  </div>
                </div>
                <div className="detail-item" style={{ gridColumn: "1/-1" }}><div className="detail-key">Title</div><div className="detail-val" style={{ fontFamily: "var(--sans)", fontSize: 14 }}>{selected.title}</div></div>
                <div className="detail-item"><div className="detail-key">Severity</div><div className="detail-val"><span className={`badge badge-${selected.severity}`}>{selected.severity}</span></div></div>
                <div className="detail-item"><div className="detail-key">CVSS</div><div className="detail-val">{selected.cvss ?? "—"}</div></div>
                <div className="detail-item"><div className="detail-key">Status</div><div className="detail-val"><span className={`badge badge-${selected.status}`}>{selected.status}</span></div></div>
                <div className="detail-item"><div className="detail-key">Disclosed</div><div className="detail-val">{selected.disclosed_on || "—"}</div></div>
                <div className="detail-item" style={{ gridColumn: "1/-1" }}><div className="detail-key">Product</div><div className="detail-val">{selected.product_name} {selected.version} / {selected.platform}</div></div>
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
