const IMMUTABLE_ASSET_PATTERN = /\.[0-9A-Z]{8,}\.(?:css|js)$/i;

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
    let response = await fetchAsset(env, request, requestUrl.pathname);

    if (shouldServeSpaShell(request, response)) {
      response = await fetchAsset(env, request, "/index.html");
      return withHeaders(response, request, "/index.html");
    }

    return withHeaders(response, request, requestUrl.pathname);
  },
};
