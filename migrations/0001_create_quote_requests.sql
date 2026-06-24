CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL UNIQUE,
  schema_version TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  preferred_contact TEXT,
  destination_market TEXT NOT NULL,
  product_category TEXT NOT NULL,
  shipment_size_code TEXT NOT NULL,
  shipment_size_label TEXT NOT NULL,
  message TEXT NOT NULL,
  consent_purpose TEXT NOT NULL,
  locale TEXT NOT NULL,
  user_agent TEXT,
  payload_json TEXT NOT NULL,
  notification_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_notification_status ON quote_requests(notification_status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);
