import { escapeText, readBoundedString } from "./quote-utils.mjs";

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

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
    <p><strong>Reference:</strong> ${escapeText(payload.requestId)}</p>
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
    subject: `New quote request ${payload.requestId}`,
    text,
    html,
  };
}

export async function sendQuoteNotification(env, payload) {
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
