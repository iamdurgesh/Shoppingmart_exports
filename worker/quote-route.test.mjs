import assert from "node:assert/strict";
import test from "node:test";

import { handleQuoteRequest } from "./quote-route.mjs";

function createRequest(origin = "https://shoppingmartexports.com") {
  return new Request("https://shoppingmartexports.com/api/quote-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: "{}",
  });
}

test("rejects quote submissions from an unapproved origin", async () => {
  const response = await handleQuoteRequest(createRequest("https://example.com"), {});

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "forbidden_origin" });
});

test("rejects quote submissions after the client rate limit is reached", async () => {
  const env = {
    QUOTE_RATE_LIMITER: {
      limit: async () => ({ success: false }),
    },
  };
  const response = await handleQuoteRequest(createRequest(), env);

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.deepEqual(await response.json(), { error: "rate_limit_exceeded" });
});

test("rejects non-POST methods", async () => {
  const request = new Request("https://shoppingmartexports.com/api/quote-requests");
  const response = await handleQuoteRequest(request, {});

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST, OPTIONS");
});
