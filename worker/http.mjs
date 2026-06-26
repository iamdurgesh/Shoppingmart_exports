const IMMUTABLE_ASSET_PATTERN = /\.[0-9A-Z]{8,}\.(?:css|js)$/i;

export function buildSecurityHeaders(request, assetPath) {
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

export function withHeaders(response, request, assetPath) {
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

export function jsonResponse(request, body, init = {}) {
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
