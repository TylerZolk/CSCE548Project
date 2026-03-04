"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { api } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [vulns, setVulns] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listVendors(),
      api.listProducts(),
      api.listVulnerabilities(100),
      api.listReports(100),
    ])
      .then(([v, p, vl, r]) => {
        setVendors(v);
        setProducts(p);
        setVulns(vl);
        setReports(r);
      })
      .finally(() => setLoading(false));
  }, []);

  const severityCounts = ["critical", "high", "medium", "low"].map(s => ({
    label: s,
    count: vulns.filter(v => v.severity === s).length,
  }));
  const maxCount = Math.max(...severityCounts.map(s => s.count), 1);

  const severityColors: Record<string, string> = {
    critical: "var(--red)",
    high: "var(--accent)",
    medium: "var(--accent2)",
    low: "var(--green)",
  };

  const statusCounts = ["open", "triage", "fixed", "wontfix"].map(s => ({
    label: s,
    count: vulns.filter(v => v.status === s).length,
  }));

  const recentVulns = vulns.slice(0, 6);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">// system overview</div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-card blue">
          <div className="stat-value">{loading ? "—" : vendors.length}</div>
          <div className="stat-label">Vendors</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{loading ? "—" : products.length}</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{loading ? "—" : vulns.length}</div>
          <div className="stat-label">Vulnerabilities</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-value">{loading ? "—" : reports.length}</div>
          <div className="stat-label">Reports</div>
        </div>
      </div>

      {!loading && (
        <div className="dash-grid">
          {/* Severity breakdown */}
          <div className="dash-card">
            <div className="dash-card-title">⚠ Severity Breakdown</div>
            {severityCounts.map(({ label, count }) => (
              <div className="bar-row" key={label}>
                <div className="bar-label">{label}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: severityColors[label],
                    }}
                  />
                </div>
                <div className="bar-count">{count}</div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <div className="dash-card">
            <div className="dash-card-title">◉ Status Breakdown</div>
            {statusCounts.map(({ label, count }) => (
              <div className="bar-row" key={label}>
                <div className="bar-label">{label}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / Math.max(...statusCounts.map(s => s.count), 1)) * 100}%`,
                      background: label === "fixed" ? "var(--green)" : label === "open" ? "var(--blue)" : label === "triage" ? "var(--purple)" : "var(--text3)",
                    }}
                  />
                </div>
                <div className="bar-count">{count}</div>
              </div>
            ))}
          </div>

          {/* Recent vulns */}
          <div className="dash-card" style={{ gridColumn: "1 / -1" }}>
            <div className="dash-card-title" style={{ justifyContent: "space-between" }}>
              <span>⊞ Recent Vulnerabilities</span>
              <Link href="/vulnerabilities" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>CVE</th>
                  <th>Title</th>
                  <th>Product</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVulns.map((v: any) => (
                  <tr key={v.vuln_id}>
                    <td>
                      {v.cve_id ? (
                        <a className="cve" href={`https://nvd.nist.gov/vuln/detail/${v.cve_id}`} target="_blank" rel="noopener noreferrer">{v.cve_id}</a>
                      ) : <span style={{ color: "var(--text3)" }}>—</span>}
                    </td>
                    <td className="text-bright">{v.title}</td>
                    <td><span className="chip">{v.product_name}</span></td>
                    <td><span className={`badge badge-${v.severity}`}>{v.severity}</span></td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && <div className="loading"><div className="spinner" /> Loading dashboard...</div>}
    </AppLayout>
  );
}
