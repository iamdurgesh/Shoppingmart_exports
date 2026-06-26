function formatDateSegment(value) {
  return value.replaceAll("-", "").replaceAll(":", "").replace("T", "-").slice(0, 15);
}

export function createQuoteReference(submittedAt, quoteNumber) {
  return `SME-${formatDateSegment(submittedAt)}-Q${String(quoteNumber).padStart(6, "0")}`;
}

export function readLastInsertRowId(result) {
  const rowId = Number(result?.meta?.last_row_id);

  if (!Number.isSafeInteger(rowId) || rowId < 1) {
    throw new Error("missing_last_insert_row_id");
  }

  return rowId;
}
