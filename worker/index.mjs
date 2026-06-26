import { withHeaders } from "./http.mjs";
import { handleQuoteRequest } from "./quote-route.mjs";

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
};
