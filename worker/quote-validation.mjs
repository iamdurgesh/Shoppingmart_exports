import {
  readAllowed,
  readBoundedString,
  readNullableBoundedString,
  readRecord,
} from "./quote-utils.mjs";

const MAX_QUOTE_REQUEST_BYTES = 16_384;
const ALLOWED_MARKETS = new Set(["European Union", "United Kingdom", "Middle East", "North America", "Other market"]);
const ALLOWED_CATEGORIES = new Set(["Consumer Goods", "Food and Staples", "Textiles", "Custom Sourcing"]);
const ALLOWED_LOCALES = new Set(["en", "de", "fr"]);
const SHIPMENT_LABELS = {
  sample: "Samples or trial order",
  pallet: "Pallet-level order",
  container: "Container load",
  mixed: "Mixed product shipment",
};

function readShipmentSize(value) {
  return typeof value === "string" && Object.hasOwn(SHIPMENT_LABELS, value) ? value : "sample";
}

function readLocale(value) {
  return typeof value === "string" && ALLOWED_LOCALES.has(value) ? value : "en";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

export async function parseJsonRequest(request) {
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

export function normalizeQuotePayload(input) {
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

  return {
    payload: {
      requestId: `SME-PENDING-${crypto.randomUUID()}`,
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
    },
  };
}
