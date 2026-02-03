-- Seed data for VulnVault (PostgreSQL)

INSERT INTO vendors (name, website) VALUES
  ('RedPine Software', 'https://redpine.example'),
  ('BlueHarbor Tech',  'https://blueharbor.example'),
  ('Northwind Cloud',  'https://northwind.example'),
  ('Acorn IoT',        'https://acorniot.example'),
  ('Sable Systems',    'https://sable.example'),
  ('KiteWorks',        'https://kiteworks.example'),
  ('Orchid Mobile',    'https://orchid.example'),
  ('GraniteSec',       'https://granitesec.example'),
  ('Sunset Web',       'https://sunsetweb.example'),
  ('Copper Labs',      'https://copperlabs.example');

-- 20 products (2 per vendor)
INSERT INTO products (vendor_id, name, version, platform)
SELECT v.vendor_id,
       CASE WHEN gs.i % 2 = 0 THEN 'CoreApp' ELSE 'EdgeAgent' END AS name,
       CASE WHEN gs.i % 3 = 0 THEN '3.2.1' WHEN gs.i % 3 = 1 THEN '2.9.0' ELSE '1.4.7' END AS version,
       CASE WHEN gs.i % 6 = 0 THEN 'windows'
            WHEN gs.i % 6 = 1 THEN 'linux'
            WHEN gs.i % 6 = 2 THEN 'mac'
            WHEN gs.i % 6 = 3 THEN 'web'
            WHEN gs.i % 6 = 4 THEN 'cloud'
            ELSE 'iot' END AS platform
FROM vendors v
JOIN LATERAL (SELECT generate_series(1,2) AS i) gs ON TRUE
ORDER BY v.vendor_id, gs.i;

-- 60 vulnerabilities
INSERT INTO vulnerabilities (product_id, cve_id, title, severity, cvss, status, disclosed_on)
SELECT p.product_id,
       'CVE-2025-' || (10000 + gs.n)::text AS cve_id,
       CASE WHEN gs.n % 5 = 0 THEN 'RCE via unsafe deserialization'
            WHEN gs.n % 5 = 1 THEN 'Auth bypass in session handling'
            WHEN gs.n % 5 = 2 THEN 'SQL injection in search endpoint'
            WHEN gs.n % 5 = 3 THEN 'XSS in admin console'
            ELSE 'Privilege escalation due to misconfig' END AS title,
       CASE WHEN gs.n % 4 = 0 THEN 'low'
            WHEN gs.n % 4 = 1 THEN 'medium'
            WHEN gs.n % 4 = 2 THEN 'high'
            ELSE 'critical' END AS severity,
       ROUND((gs.n % 11) * 1.0, 1) AS cvss,
       CASE WHEN gs.n % 4 = 0 THEN 'open'
            WHEN gs.n % 4 = 1 THEN 'triage'
            WHEN gs.n % 4 = 2 THEN 'fixed'
            ELSE 'open' END AS status,
       (CURRENT_DATE - (gs.n % 120))::date AS disclosed_on
FROM products p
JOIN LATERAL (SELECT generate_series(1,3) AS n) gs ON TRUE
LIMIT 60;

-- 60 reports (one per vulnerability)
INSERT INTO reports (vuln_id, reporter, source, notes, is_verified)
SELECT v.vuln_id,
       CASE WHEN v.vuln_id % 4 = 0 THEN 'ScannerBot'
            WHEN v.vuln_id % 4 = 1 THEN 'BugBountyHunter42'
            WHEN v.vuln_id % 4 = 2 THEN 'InternalSecTeam'
            ELSE 'CustomerIT' END AS reporter,
       CASE WHEN v.vuln_id % 5 = 0 THEN 'scanner'
            WHEN v.vuln_id % 5 = 1 THEN 'bugbounty'
            WHEN v.vuln_id % 5 = 2 THEN 'internal'
            WHEN v.vuln_id % 5 = 3 THEN 'vendor'
            ELSE 'customer' END AS source,
       'Initial report created for triage/testing.' AS notes,
       (v.vuln_id % 3 = 0) AS is_verified
FROM vulnerabilities v
ORDER BY v.vuln_id
LIMIT 60;
