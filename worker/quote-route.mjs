import { jsonResponse } from "./http.mjs";
import { sendQuoteNotification } from "./quote-email.mjs";
import { insertQuoteRequest, updateQuoteNotificationStatus } from "./quote-repository.mjs";
import { normalizeQuotePayload, parseJsonRequest } from "./quote-validation.mjs";

export async function handleQuoteRequest(request, env) {
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

  let storedPayload;

  try {
    storedPayload = await insertQuoteRequest(env.QUOTE_DB, normalized.payload);
  } catch {
    return jsonResponse(request, { error: "database_write_failed" }, { status: 500 });
  }

  const notificationStatus = await sendQuoteNotification(env, storedPayload).catch(() => "failed");

  await updateQuoteNotificationStatus(env.QUOTE_DB, storedPayload.requestId, notificationStatus).catch(() => undefined);

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
