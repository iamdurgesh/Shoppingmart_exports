export function readBoundedString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function readNullableBoundedString(value, maxLength) {
  const text = readBoundedString(value, maxLength);
  return text || null;
}

export function readRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function readAllowed(value, allowedValues, fallback) {
  return typeof value === "string" && allowedValues.has(value) ? value : fallback;
}

export function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
