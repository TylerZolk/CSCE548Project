DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS vulnerabilities;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS vendors;

CREATE TABLE vendors (
  vendor_id   BIGSERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL UNIQUE,
  website     VARCHAR(255),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT vendors_website_format
    CHECK (website IS NULL OR website ~* '^https?://')
);

CREATE TABLE products (
  product_id  BIGSERIAL PRIMARY KEY,
  vendor_id   BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE RESTRICT,
  name        VARCHAR(120) NOT NULL,
  version     VARCHAR(60)  NOT NULL,
  platform    VARCHAR(30)  NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT products_platform_allowed
    CHECK (platform IN ('windows','linux','mac','web','mobile','cloud','iot')),
  CONSTRAINT products_vendor_name_version_unique
    UNIQUE (vendor_id, name, version)
);

CREATE TABLE vulnerabilities (
  vuln_id       BIGSERIAL PRIMARY KEY,
  product_id    BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  cve_id        VARCHAR(20),
  title         VARCHAR(180) NOT NULL,
  severity      VARCHAR(10) NOT NULL,
  cvss          NUMERIC(3,1),
  status        VARCHAR(12) NOT NULL DEFAULT 'open',
  disclosed_on  DATE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT vuln_cve_format
    CHECK (cve_id IS NULL OR cve_id ~ '^CVE-[0-9]{4}-[0-9]{4,}$'),
  CONSTRAINT vuln_severity_allowed
    CHECK (severity IN ('low','medium','high','critical')),
  CONSTRAINT vuln_status_allowed
    CHECK (status IN ('open','triage','fixed','wontfix')),
  CONSTRAINT vuln_cvss_range
    CHECK (cvss IS NULL OR (cvss >= 0.0 AND cvss <= 10.0)),
  CONSTRAINT vuln_cve_unique UNIQUE (cve_id)
);

CREATE TABLE reports (
  report_id     BIGSERIAL PRIMARY KEY,
  vuln_id       BIGINT NOT NULL REFERENCES vulnerabilities(vuln_id) ON DELETE CASCADE,
  reporter      VARCHAR(120) NOT NULL,
  source        VARCHAR(20) NOT NULL,
  notes         TEXT,
  reported_on   TIMESTAMP NOT NULL DEFAULT NOW(),
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,

  CONSTRAINT reports_source_allowed
    CHECK (source IN ('internal','bugbounty','vendor','scanner','customer'))
);

CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_vuln_product_id ON vulnerabilities(product_id);
CREATE INDEX idx_reports_vuln_id ON reports(vuln_id);
