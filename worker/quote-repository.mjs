import { createQuoteReference, readLastInsertRowId } from "./quote-reference.mjs";

export function buildStoredPayloadSummary(payload) {
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

export async function insertQuoteRequest(db, payload) {
  const insertResult = await db
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
  const quoteNumber = readLastInsertRowId(insertResult);
  const storedPayload = {
    ...payload,
    requestId: createQuoteReference(payload.submittedAt, quoteNumber),
  };

  await db
    .prepare(
      `UPDATE quote_requests
       SET request_id = ?, payload_json = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    )
    .bind(
      storedPayload.requestId,
      JSON.stringify(buildStoredPayloadSummary(storedPayload)),
      quoteNumber,
    )
    .run();

  return storedPayload;
}

export async function updateQuoteNotificationStatus(db, requestId, notificationStatus) {
  await db
    .prepare(
      `UPDATE quote_requests
       SET notification_status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE request_id = ?`,
    )
    .bind(notificationStatus, requestId)
    .run();
}
