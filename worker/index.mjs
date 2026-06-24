const IMMUTABLE_ASSET_PATTERN = /\.[0-9A-Z]{8,}\.(?:css|js)$/i;
const MAX_QUOTE_REQUEST_BYTES = 16_384;
const ALLOWED_MARKETS = new Set(["European Union", "United Kingdom", "Middle East", "North America", "Other market"]);
const ALLOWED_CATEGORIES = new Set(["Consumer Goods", "Food and Staples", "Textiles", "Custom Sourcing"]);
const ALLOWED_LOCALES = new Set(["en", "de", "fr"]);
const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const SHIPMENT_LABELS = {
  sample: "Samples or trial order",
  pallet: "Pallet-level order",
  container: "Container load",
  mixed: "Mixed product shipment",
};

function buildSecurityHeaders(request, assetPath) {
  const headers = new Headers();
  const isDocumentRequest =
    request.method === "GET" &&
    request.headers.get("accept")?.includes("text/html");

  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=(), browsing-topics=()");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (request.url.startsWith("https://")) {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  if (isDocumentRequest) {
    headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self'",
        "font-src 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "img-src 'self' data: blob:",
        "media-src 'self'",
        "object-src 'none'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "upgrade-insecure-requests",
      ].join("; "),
    );
  }

  if (IMMUTABLE_ASSET_PATTERN.test(assetPath)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (assetPath.endsWith(".html") || assetPath === "/") {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  return headers;
}

function withHeaders(response, request, assetPath) {
  const headers = new Headers(response.headers);
  const securityHeaders = buildSecurityHeaders(request, assetPath);

  for (const [key, value] of securityHeaders.entries()) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function jsonResponse(request, body, init = {}) {
  const status = init.status ?? 200;
  const hasBody = ![204, 205, 304].includes(status);
  const response = new Response(hasBody ? JSON.stringify(body) : null, {
    ...init,
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });

  return withHeaders(response, request, "/api/quote-requests");
}

function readBoundedString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readNullableBoundedString(value, maxLength) {
  const text = readBoundedString(value, maxLength);
  return text || null;
}

function readRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function readAllowed(value, allowedValues, fallback) {
  return typeof value === "string" && allowedValues.has(value) ? value : fallback;
}

function readShipmentSize(value) {
  return typeof value === "string" && Object.hasOwn(SHIPMENT_LABELS, value) ? value : "sample";
}

function readLocale(value) {
  return typeof value === "string" && ALLOWED_LOCALES.has(value) ? value : "en";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function readBoundedRequestText(request) {
  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;

    if (receivedBytes > MAX_QUOTE_REQUEST_BYTES) {
      throw new Error("payload_too_large");
    }

    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}

function normalizeQuotePayload(input) {
  const payload = readRecord(input);
  const contact = readRecord(payload.contact);
  const trade = readRecord(payload.trade);
  const shipmentSize = readRecord(trade.shipmentSize);
  const enquiry = readRecord(payload.enquiry);
  const consent = readRecord(payload.consent);
  const metadata = readRecord(payload.metadata);
  const now = new Date().toISOString();
  const volume = readShipmentSize(shipmentSize.code);
  const fullName = readBoundedString(contact.fullName, 120);
  const email = readBoundedString(contact.email, 160).toLowerCase();
  const message = readBoundedString(enquiry.message, 4000);
  const errors = [];

  if (fullName.length < 2) {
    errors.push("fullName");
  }

  if (!isValidEmail(email)) {
    errors.push("email");
  }

  if (message.length < 24) {
    errors.push("message");
  }

  if (consent.quotationFollowUpAccepted !== true) {
    errors.push("consent");
  }

  if (errors.length > 0) {
    return { errors };
  }

  const requestId = crypto.randomUUID();
  const normalized = {
    requestId,
    schemaVersion: "quote-request.v1",
    submittedAt: now,
    source: "website-quote-form",
    status: "queued",
    contact: {
      fullName,
      email,
      companyName: readNullableBoundedString(contact.companyName, 160),
      preferredContact: readNullableBoundedString(contact.preferredContact, 160),
    },
    trade: {
      destinationMarket: readAllowed(trade.destinationMarket, ALLOWED_MARKETS, "European Union"),
      productCategory: readAllowed(trade.productCategory, ALLOWED_CATEGORIES, "Consumer Goods"),
      shipmentSize: {
        code: volume,
        label: SHIPMENT_LABELS[volume],
      },
    },
    enquiry: {
      message,
    },
    consent: {
      quotationFollowUpAccepted: true,
      purpose: "quotation-follow-up",
    },
    metadata: {
      locale: readLocale(metadata.locale),
    },
  };

  return { payload: normalized };
}

async function parseJsonRequest(request) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (!contentType.includes("application/json")) {
    return { error: "unsupported_media_type" };
  }

  if (contentLength > MAX_QUOTE_REQUEST_BYTES) {
    return { error: "payload_too_large" };
  }

  try {
    return { body: JSON.parse(await readBoundedRequestText(request)) };
  } catch (error) {
    if (error instanceof Error && error.message === "payload_too_large") {
      return { error: "payload_too_large" };
    }

    return { error: "invalid_json" };
  }
}

function buildStoredPayloadSummary(payload) {
  return {
    requestId: payload.requestId,
    schemaVersion: payload.schemaVersion,
    submittedAt: payload.submittedAt,
    source: payload.source,
    status: payload.status,
    trade: payload.trade,
    consent: payload.consent,
    metadata: payload.metadata,
  };
}

async function insertQuoteRequest(db, payload) {
  await db
    .prepare(
      `INSERT INTO quote_requests (
        request_id,
        schema_version,
        submitted_at,
        source,
        status,
        full_name,
        email,
        company_name,
        preferred_contact,
        destination_market,
        product_category,
        shipment_size_code,
        shipment_size_label,
        message,
        consent_purpose,
        locale,
        user_agent,
        payload_json,
        notification_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      payload.requestId,
      payload.schemaVersion,
      payload.submittedAt,
      payload.source,
      payload.status,
      payload.contact.fullName,
      payload.contact.email,
      payload.contact.companyName,
      payload.contact.preferredContact,
      payload.trade.destinationMarket,
      payload.trade.productCategory,
      payload.trade.shipmentSize.code,
      payload.trade.shipmentSize.label,
      payload.enquiry.message,
      payload.consent.purpose,
      payload.metadata.locale,
      null,
      JSON.stringify(buildStoredPayloadSummary(payload)),
      "pending",
    )
    .run();
}

async function updateQuoteNotificationStatus(db, requestId, notificationStatus) {
  await db
    .prepare(
      `UPDATE quote_requests
       SET notification_status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE request_id = ?`,
    )
    .bind(notificationStatus, requestId)
    .run();
}

function buildQuoteNotificationEmail(payload) {
  const optionalCompany = payload.contact.companyName ? `Company: ${payload.contact.companyName}\n` : "";
  const optionalContact = payload.contact.preferredContact ? `Preferred contact: ${payload.contact.preferredContact}\n` : "";

  const text = [
    `New quote request: ${payload.requestId}`,
    "",
    `Submitted: ${payload.submittedAt}`,
    `Name: ${payload.contact.fullName}`,
    `Email: ${payload.contact.email}`,
    optionalCompany.trimEnd(),
    optionalContact.trimEnd(),
    `Market: ${payload.trade.destinationMarket}`,
    `Category: ${payload.trade.productCategory}`,
    `Shipment size: ${payload.trade.shipmentSize.label}`,
    `Locale: ${payload.metadata.locale}`,
    "",
    "Message:",
    payload.enquiry.message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h2>New quote request</h2>
    <p><strong>Request ID:</strong> ${escapeText(payload.requestId)}</p>
    <p><strong>Submitted:</strong> ${escapeText(payload.submittedAt)}</p>
    <p><strong>Name:</strong> ${escapeText(payload.contact.fullName)}</p>
    <p><strong>Email:</strong> ${escapeText(payload.contact.email)}</p>
    ${payload.contact.companyName ? `<p><strong>Company:</strong> ${escapeText(payload.contact.companyName)}</p>` : ""}
    ${payload.contact.preferredContact ? `<p><strong>Preferred contact:</strong> ${escapeText(payload.contact.preferredContact)}</p>` : ""}
    <p><strong>Market:</strong> ${escapeText(payload.trade.destinationMarket)}</p>
    <p><strong>Category:</strong> ${escapeText(payload.trade.productCategory)}</p>
    <p><strong>Shipment size:</strong> ${escapeText(payload.trade.shipmentSize.label)}</p>
    <p><strong>Locale:</strong> ${escapeText(payload.metadata.locale)}</p>
    <h3>Message</h3>
    <p>${escapeText(payload.enquiry.message).replaceAll("\n", "<br>")}</p>
  `;

  return {
    subject: `New quote request from ${payload.contact.fullName}`,
    text,
    html,
  };
}

async function sendQuoteNotification(env, payload) {
  const apiKey = readBoundedString(env.RESEND_API_KEY, 512);
  const from = readBoundedString(env.QUOTE_NOTIFICATION_FROM, 320);
  const to = readBoundedString(env.QUOTE_NOTIFICATION_TO, 320);

  if (!apiKey || !from || !to) {
    return "not_configured";
  }

  const email = buildQuoteNotificationEmail(payload);
  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.requestId,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: email.subject,
      text: email.text,
      html: email.html,
      reply_to: payload.contact.email,
      tags: [
        {
          name: "source",
          value: "website_quote_form",
        },
      ],
    }),
  });

  return response.ok ? "sent" : "failed";
}

async function handleQuoteRequest(request, env) {
  if (request.method === "OPTIONS") {
    return jsonResponse(request, {}, { status: 204 });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "method_not_allowed" }, { status: 405, headers: { Allow: "POST, OPTIONS" } });
  }

  if (!env.QUOTE_DB) {
    return jsonResponse(request, { error: "database_not_configured" }, { status: 503 });
  }

  const parsed = await parseJsonRequest(request);

  if (parsed.error) {
    return jsonResponse(request, { error: parsed.error }, { status: parsed.error === "payload_too_large" ? 413 : 400 });
  }

  const normalized = normalizeQuotePayload(parsed.body);

  if (normalized.errors) {
    return jsonResponse(request, { error: "validation_failed", fields: normalized.errors }, { status: 422 });
  }

  try {
    await insertQuoteRequest(env.QUOTE_DB, normalized.payload);
  } catch {
    return jsonResponse(request, { error: "database_write_failed" }, { status: 500 });
  }

  const notificationStatus = await sendQuoteNotification(env, normalized.payload).catch(() => "failed");

  await updateQuoteNotificationStatus(env.QUOTE_DB, normalized.payload.requestId, notificationStatus).catch(() => undefined);

  return jsonResponse(
    request,
    {
      requestId: normalized.payload.requestId,
      savedAt: normalized.payload.submittedAt,
      status: normalized.payload.status,
    },
    { status: 201 },
  );
}

async function fetchAsset(env, request, assetPath) {
  return env.ASSETS.fetch(new URL(assetPath, request.url));
}

function shouldServeSpaShell(request, response) {
  if (response.status !== 404) {
    return false;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const pathname = new URL(request.url).pathname;

  if (pathname.includes(".")) {
    return false;
  }

  const accept = request.headers.get("accept") ?? "";

  return accept.includes("text/html") || accept.includes("*/*") || accept === "";
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === "/api/quote-requests") {
      return handleQuoteRequest(request, env);
    }

    let response = await fetchAsset(env, request, requestUrl.pathname);

    if (shouldServeSpaShell(request, response)) {
      response = await fetchAsset(env, request, "/index.html");
      return withHeaders(response, request, "/index.html");
    }

    return withHeaders(response, request, requestUrl.pathname);
  },
};
