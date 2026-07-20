import type { Env } from "../types";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

const cacheByScope = new Map<string, CachedToken>();

const TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
export const BASE_SCOPE = "https://api.ebay.com/oauth/api_scope";
export const INSIGHTS_SCOPE =
  "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/buy.marketplace.insights";

/** Application access token (client credentials). */
export async function getAppAccessToken(
  env: Env,
  scope: string = BASE_SCOPE,
): Promise<string> {
  const now = Date.now();
  const cached = cacheByScope.get(scope);
  if (cached && cached.expiresAt > now + 60_000) {
    return cached.accessToken;
  }

  const clientId = env.EBAY_CLIENT_ID?.trim();
  const clientSecret = env.EBAY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("EBAY_CLIENT_ID / EBAY_CLIENT_SECRET not configured");
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${basic}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay OAuth failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cacheByScope.set(scope, {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  });

  return data.access_token;
}
