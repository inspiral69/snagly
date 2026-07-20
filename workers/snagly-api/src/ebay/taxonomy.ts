import { getAppAccessToken } from "./auth";
import type { Env } from "../types";

const TAXONOMY_BASE = "https://api.ebay.com/commerce/taxonomy/v1";

/** Resolve the best eBay UK category ID for astronomical telescopes. */
export async function resolveTelescopesCategoryId(env: Env): Promise<string | null> {
  const token = await getAppAccessToken(env);

  const treeRes = await fetch(
    `${TAXONOMY_BASE}/get_default_category_tree_id?marketplace_id=EBAY_GB`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "Accept-Language": "en-GB",
      },
    },
  );

  if (!treeRes.ok) {
    console.warn("Taxonomy tree id failed:", await treeRes.text());
    return null;
  }

  const tree = (await treeRes.json()) as { categoryTreeId?: string };
  const treeId = tree.categoryTreeId;
  if (!treeId) return null;

  const suggestUrl = new URL(
    `${TAXONOMY_BASE}/category_tree/${treeId}/get_category_suggestions`,
  );
  suggestUrl.searchParams.set("q", "astronomical telescope");

  const suggestRes = await fetch(suggestUrl.toString(), {
    headers: {
      authorization: `Bearer ${token}`,
      "Accept-Language": "en-GB",
    },
  });

  if (!suggestRes.ok) {
    console.warn("Category suggestions failed:", await suggestRes.text());
    return null;
  }

  const data = (await suggestRes.json()) as {
    categorySuggestions?: {
      category?: { categoryId?: string; categoryName?: string };
      categoryTreeNodeAncestors?: { categoryName?: string }[];
    }[];
  };

  const suggestions = data.categorySuggestions ?? [];
  for (const s of suggestions) {
    const name = (s.category?.categoryName ?? "").toLowerCase();
    const id = s.category?.categoryId;
    if (!id) continue;
    // Prefer leaf "Telescopes" over binoculars / accessories
    if (name === "telescopes" || name.includes("telescope")) {
      console.log("Resolved telescopes category:", id, s.category?.categoryName);
      return id;
    }
  }

  const fallback = suggestions[0]?.category?.categoryId ?? null;
  if (fallback) {
    console.log(
      "Using first taxonomy suggestion:",
      fallback,
      suggestions[0]?.category?.categoryName,
    );
  }
  return fallback;
}
