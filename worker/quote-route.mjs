import { jsonResponse } from "./http.mjs";
import { sendQuoteNotification } from "./quote-email.mjs";
import { insertQuoteRequest, updateQuoteNotificationStatus } from "./quote-repository.mjs";
import { normalizeQuotePayload, parseJsonRequest } from "./quote-validation.mjs";

const ALLOWED_ORIGINS = new Set([
  "https://shoppingmartexports.com",
  "https://www.shoppingmartexports.com",
]);

function hasAllowedOrigin(request) {
  const origin = request.headers.get("Origin");
  return origin !== null && ALLOWED_ORIGINS.has(origin);
}

async function isWithinRateLimit(request, env) {
  if (!env.QUOTE_RATE_LIMITER) {
    console.error("quote.rate_limiter_not_configured");
    return null;
  }

  const clientAddress = request.headers.get("CF-Connecting-IP") ?? "unknown-client";
  return env.QUOTE_RATE_LIMITER.limit({ key: clientAddress });
}

export async function handleQuoteRequest(request, env) {
  if (request.method === "OPTIONS") {
    return jsonResponse(request, {}, { status: 204 });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "method_not_allowed" }, { status: 405, headers: { Allow: "POST, OPTIONS" } });
  }

  if (!hasAllowedOrigin(request)) {
    return jsonResponse(request, { error: "forbidden_origin" }, { status: 403 });
  }

  const rateLimit = await isWithinRateLimit(request, env).catch(() => null);

  if (!rateLimit) {
    return jsonResponse(request, { error: "rate_limiter_unavailable" }, { status: 503 });
  }

  if (!rateLimit.success) {
    return jsonResponse(
      request,
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  if (!env.QUOTE_DB) {
    console.error("quote.database_not_configured");
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

  let storedPayload;

  try {
    storedPayload = await insertQuoteRequest(env.QUOTE_DB, normalized.payload);
  } catch {
    console.error("quote.database_write_failed");
    return jsonResponse(request, { error: "database_write_failed" }, { status: 500 });
  }

  const notificationStatus = await sendQuoteNotification(env, storedPayload).catch(() => "failed");

  if (notificationStatus === "failed") {
    console.error("quote.notification_failed");
  }

  await updateQuoteNotificationStatus(env.QUOTE_DB, storedPayload.requestId, notificationStatus).catch(() => {
    console.error("quote.notification_status_update_failed");
  });

  return jsonResponse(
    request,
    {
      requestId: storedPayload.requestId,
      savedAt: storedPayload.submittedAt,
      status: storedPayload.status,
    },
    { status: 201 },
  );
}
