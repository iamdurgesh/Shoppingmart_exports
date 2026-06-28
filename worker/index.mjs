import { withHeaders } from "./http.mjs";
import { handleQuoteRequest } from "./quote-route.mjs";
import { deleteExpiredQuoteRequests } from "./quote-repository.mjs";

const CANONICAL_HOST = "shoppingmartexports.com";
const PUBLIC_ROUTES = new Set([
  "/",
  "/compliance",
  "/contact",
  "/privacy-policy",
  "/products/custom-sourcing",
]);

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

  if (!PUBLIC_ROUTES.has(pathname)) {
    return false;
  }

  if (pathname.includes(".")) {
    return false;
  }

  const accept = request.headers.get("accept") ?? "";

  return accept.includes("text/html") || accept.includes("*/*") || accept === "";
}

function getCanonicalRedirect(requestUrl) {
  const sourceUrl = new URL(requestUrl);
  const canonicalUrl = new URL(`${sourceUrl.pathname}${sourceUrl.search}`, `https://${CANONICAL_HOST}`);
  let shouldRedirect = false;

  if (sourceUrl.hostname === `www.${CANONICAL_HOST}`) {
    shouldRedirect = true;
  }

  if (sourceUrl.pathname.length > 1 && sourceUrl.pathname.endsWith("/")) {
    const pathWithoutTrailingSlash = sourceUrl.pathname.replace(/\/+$/, "");

    if (PUBLIC_ROUTES.has(pathWithoutTrailingSlash)) {
      canonicalUrl.pathname = pathWithoutTrailingSlash;
      shouldRedirect = true;
    }
  }

  return shouldRedirect ? canonicalUrl : null;
}

function getRetentionDays(value) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed >= 30 && parsed <= 3650 ? parsed : 365;
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const canonicalRedirect = getCanonicalRedirect(requestUrl);

    if (canonicalRedirect) {
      return Response.redirect(canonicalRedirect, 308);
    }

    if (requestUrl.pathname === "/api/quote-requests") {
      return handleQuoteRequest(request, env);
    }

    let response = await fetchAsset(env, request, requestUrl.pathname);

    if (shouldServeSpaShell(request, response)) {
      response = await fetchAsset(env, request, "/index.html");
      return withHeaders(response, request, "/index.html");
    }

    return withHeaders(response, request, requestUrl.pathname);
  },
  scheduled(_controller, env, context) {
    const retentionDays = getRetentionDays(env.QUOTE_RETENTION_DAYS);

    context.waitUntil(
      deleteExpiredQuoteRequests(env.QUOTE_DB, retentionDays)
        .then((deletedCount) => {
          console.log("quote.retention_cleanup_completed", { deletedCount });
        })
        .catch((error) => {
          console.error("quote.retention_cleanup_failed", {
            errorName: error instanceof Error ? error.name : "UnknownError",
          });
          throw error;
        }),
    );
  },
};
