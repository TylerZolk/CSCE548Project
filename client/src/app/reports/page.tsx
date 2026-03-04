"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { api } from "@/lib/api";

const SOURCES = ["internal", "bugbounty", "vendor", "scanner", "customer"];

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [vulns, setVulns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [limit, setLimit] = useState(25);
  const [modal, setModal] = useState<"create" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ vuln_id: "", reporter: "", source: "internal", notes: "", is_verified: false });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.listReports(limit), api.listVulnerabilities(100)])
      .then(([r, v]) => { setReports(r); setVulns(v); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [limit]);

  const filtered = reports.filter(r => {
    const matchSearch =
      r.reporter.toLowerCase().includes(search.toLowerCase()) ||
      (r.cve_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.title || "").toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === "all" || r.source === filterSource;
    const matchVerified = filterVerified === "all" || (filterVerified === "yes" ? r.is_verified : !r.is_verified);
    return matchSearch && matchSource && matchVerified;
  });

  const openCreate = () => {
    setForm({ vuln_id: vulns[0]?.vuln_id?.toString() || "", reporter: "", source: "internal", notes: "", is_verified: false });
    setModal("create");
  };
  const openEdit = (r: any) => {
    setSelected(r);
    setForm({ vuln_id: r.vuln_id.toString(), reporter: r.reporter, source: r.source, notes: r.notes || "", is_verified: r.is_verified });
    setModal("edit");
  };
  const openDetail = (r: any) => { setSelected(r); setModal("detail"); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { vuln_id: Number(form.vuln_id), reporter: form.reporter, source: form.source, notes: form.notes || null, is_verified: form.is_verified };
      if (modal === "create") await api.createReport(data);
      else await api.updateReport(selected.report_id, data);
      setModal(null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this report?")) return;
    try { await api.deleteReport(id); load(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-subtitle">// showing {filtered.length} of {reports.length} records</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Report</button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="search-input" style={{ width: 240 }} placeholder="Search reporter, CVE, title..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: "auto" }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="all">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: "auto" }} value={filterVerified} onChange={e => setFilterVerified(e.target.value)}>
          <option value="all">All</option>
          <option value="yes">Verified</option>
          <option value="no">Unverified</option>
        </select>
        <select className="form-select" style={{ width: "auto" }} value={limit} onChange={e => setLimit(Number(e.target.value))}>
          <option value={25}>Last 25</option>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
        </select>
      </div>

      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="table-title">All Reports</div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>{filtered.length} results</span>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No reports found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vulnerability</th>
                <th>Reporter</th>
                <th>Source</th>
                <th>Verified</th>
                <th>Reported On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.report_id}>
                  <td className="mono" style={{ color: "var(--text3)" }}>#{r.report_id}</td>
                  <td style={{ cursor: "pointer" }} onClick={() => openDetail(r)}>
                    <div style={{ color: "var(--text)" }}>{r.title || "—"}</div>
                    {r.cve_id && <a className="cve" href={`https://nvd.nist.gov/vuln/detail/${r.cve_id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>{r.cve_id}</a>}
                  </td>
                  <td style={{ color: "var(--text2)" }}>{r.reporter}</td>
                  <td><span className="chip">{r.source}</span></td>
                  <td>
                    <span className={`badge badge-${r.is_verified ? "verified" : "unverified"}`}>
                      {r.is_verified ? "✓ verified" : "unverified"}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: "var(--text3)" }}>
                    {new Date(r.reported_on).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.report_id)}>Del</button>
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
              <div className="modal-title">{modal === "create" ? "New Report" : "Edit Report"}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Vulnerability *</label>
                <select className="form-select" value={form.vuln_id} onChange={e => setForm(f => ({ ...f, vuln_id: e.target.value }))}>
                  {vulns.map(v => <option key={v.vuln_id} value={v.vuln_id}>{v.cve_id || `#${v.vuln_id}`} – {v.title?.substring(0, 40)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reporter *</label>
                <input className="form-input" value={form.reporter} onChange={e => setForm(f => ({ ...f, reporter: e.target.value }))} placeholder="Reporter name or handle" />
              </div>
              <div className="form-group">
                <label className="form-label">Source *</label>
                <select className="form-select" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." style={{ resize: "vertical" }} />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="verified" checked={form.is_verified} onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
                <label htmlFor="verified" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", cursor: "pointer" }}>Mark as verified</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.reporter}>
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
              <div className="modal-title">Report Details</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-key">Report ID</div><div className="detail-val">#{selected.report_id}</div></div>
                <div className="detail-item"><div className="detail-key">Reported On</div><div className="detail-val">{new Date(selected.reported_on).toLocaleDateString()}</div></div>
                <div className="detail-item"><div className="detail-key">Reporter</div><div className="detail-val">{selected.reporter}</div></div>
                <div className="detail-item"><div className="detail-key">Source</div><div className="detail-val">{selected.source}</div></div>
                <div className="detail-item"><div className="detail-key">Verified</div><div className="detail-val"><span className={`badge badge-${selected.is_verified ? "verified" : "unverified"}`}>{selected.is_verified ? "✓ verified" : "unverified"}</span></div></div>
                <div className="detail-item"><div className="detail-key">CVE</div><div className="detail-val">{selected.cve_id || "—"}</div></div>
                <div className="detail-item" style={{ gridColumn: "1/-1" }}><div className="detail-key">Vulnerability</div><div className="detail-val" style={{ fontFamily: "var(--sans)", fontSize: 14 }}>{selected.title}</div></div>
                {selected.notes && <div className="detail-item" style={{ gridColumn: "1/-1" }}><div className="detail-key">Notes</div><div className="detail-val" style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--text2)" }}>{selected.notes}</div></div>}
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
