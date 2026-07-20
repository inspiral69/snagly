/**
 * Snagly API — eBay UK telescope search + Marketplace Account Deletion.
 */

import { searchListings } from "./ebay/browse";
import { getComps } from "./ebay/comps";
import { getDeals } from "./ebay/deals";
import type { Env } from "./types";

export type { Env };

const DELETION_PATH = "/ebay/marketplace-account-deletion";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";

    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }

    if (request.method === "GET" && (path === "/" || path === "/health")) {
      return cors(
        json({
          ok: true,
          service: "snagly-api",
          niche: "telescopes",
          marketplace: "EBAY_GB",
          ebayConfigured: Boolean(env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET),
          ebayDeletion: DELETION_PATH,
        }),
      );
    }

    if (path === "/v1/ebay/search" && request.method === "GET") {
      return cors(await handleSearch(request, url, env));
    }

    if (path === "/v1/ebay/comps" && request.method === "GET") {
      return cors(await handleComps(request, url, env));
    }

    if (path === "/v1/ebay/deals" && request.method === "GET") {
      return cors(await handleDeals(request, url, env));
    }

    if (path === DELETION_PATH) {
      if (request.method === "GET") {
        return handleChallenge(url, env);
      }
      if (request.method === "POST") {
        return handleDeletionNotification(request, env, ctx);
      }
      return json({ error: "method not allowed" }, 405);
    }

    return cors(json({ error: "not found" }, 404));
  },
} satisfies ExportedHandler<Env>;

async function handleSearch(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response> {
  if (!authorizeApp(request, env)) {
    return json({ error: "unauthorized" }, 401);
  }

  const keywords = url.searchParams.get("q")?.trim() ?? "";
  const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "20", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 20;

  if (!keywords) {
    return json({ error: "q (keywords) is required" }, 400);
  }

  try {
    const result = await searchListings(env, { keywords, limit });
    return json({
      ok: true,
      niche: "telescopes",
      marketplace: "ebay_uk",
      keywords,
      categoryId: result.categoryId,
      total: result.total,
      items: result.items,
    });
  } catch (error) {
    console.error("Search failed:", error);
    return json(
      {
        error: "ebay_search_failed",
        message: error instanceof Error ? error.message : "unknown error",
      },
      502,
    );
  }
}

async function handleComps(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response> {
  if (!authorizeApp(request, env)) {
    return json({ error: "unauthorized" }, 401);
  }

  const keywords = url.searchParams.get("q")?.trim() ?? "";
  const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "30", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 30;

  if (!keywords) {
    return json({ error: "q (keywords) is required" }, 400);
  }

  try {
    const result = await getComps(env, keywords, limit);
    return json(result);
  } catch (error) {
    console.error("Comps failed:", error);
    return json(
      {
        error: "ebay_comps_failed",
        message: error instanceof Error ? error.message : "unknown error",
      },
      502,
    );
  }
}

async function handleDeals(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response> {
  if (!authorizeApp(request, env)) {
    return json({ error: "unauthorized" }, 401);
  }

  const keywords = url.searchParams.get("q")?.trim() ?? "";
  const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "15", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 15;

  if (!keywords) {
    return json({ error: "q (keywords) is required" }, 400);
  }

  try {
    const result = await getDeals(env, keywords, limit);
    return json(result);
  } catch (error) {
    console.error("Deals failed:", error);
    return json(
      {
        error: "ebay_deals_failed",
        message: error instanceof Error ? error.message : "unknown error",
      },
      502,
    );
  }
}

function authorizeApp(request: Request, env: Env): boolean {
  const required = env.SNAGLY_API_KEY?.trim();
  if (!required) return true;
  const auth = request.headers.get("Authorization") ?? "";
  return auth === `Bearer ${required}`;
}

async function handleChallenge(url: URL, env: Env): Promise<Response> {
  const challengeCode = url.searchParams.get("challenge_code");
  if (!challengeCode) {
    return json({ error: "missing challenge_code" }, 400);
  }

  const token = env.EBAY_VERIFICATION_TOKEN?.trim();
  if (!token) {
    console.error("EBAY_VERIFICATION_TOKEN is not set");
    return json({ error: "server misconfigured" }, 500);
  }

  const endpoint = `${url.origin}${DELETION_PATH}`;
  const challengeResponse = await sha256Hex(challengeCode + token + endpoint);

  return new Response(JSON.stringify({ challengeResponse }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

async function handleDeletionNotification(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const raw = await request.text();
  const signature = request.headers.get("x-ebay-signature");

  ctx.waitUntil(
    (async () => {
      try {
        const payload = JSON.parse(raw) as {
          notification?: {
            notificationId?: string;
            data?: { username?: string; userId?: string; eiasToken?: string };
          };
        };
        const data = payload.notification?.data;
        console.log(
          JSON.stringify({
            event: "ebay_marketplace_account_deletion",
            notificationId: payload.notification?.notificationId,
            userId: data?.userId,
            username: data?.username,
            hasEiasToken: Boolean(data?.eiasToken),
            hasSignature: Boolean(signature),
          }),
        );
      } catch (error) {
        console.error("Failed to parse deletion notification:", error);
      }
    })(),
  );

  return new Response(null, { status: 204 });
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, authorization");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
