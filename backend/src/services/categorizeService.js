import Rule from "../models/Rule.js";

/**
 * Get category for a transaction description.
 * Priority:
 *   1. User-specific saved rule (from previous corrections)
 *   2. Global keyword-based rules
 *   3. "Uncategorized"
 *
 * @param {Object} params
 * @param {String} params.description - raw merchant/transaction text
 * @param {String|ObjectId} params.userId - current user
 */
export async function categorizeTransaction({ description, userId }) {
  if (!description || typeof description !== "string") {
    return "Uncategorized";
  }

  const descLower = description.toLowerCase().trim();

  // 1. Check for user-specific rules
  // Example: user created a rule that says "uber eats" -> "Food Delivery"
  // We match by substring.
  const userRules = await Rule.find({ userId }).lean();

  for (const r of userRules) {
    // r.matchText is already lowercased in the model
    if (descLower.includes(r.matchText)) {
      return r.category;
    }
  }

  // 2. Global keyword-based rules (hardcoded for now)
  if (
    descLower.includes("uber eats") ||
    descLower.includes("doordash") ||
    descLower.includes("menulog")
  ) {
    return "Food Delivery";
  }

  if (
    descLower.includes("mcdonald") ||
    descLower.includes("kfc") ||
    descLower.includes("restaurant") ||
    descLower.includes("grilld") ||
    descLower.includes("hungry jacks") ||
    descLower.includes("hungry jack") ||
    descLower.includes("subway")
  ) {
    return "Eating Out";
  }

  if (
    descLower.includes("coles") ||
    descLower.includes("woolworths") ||
    descLower.includes("woolies") ||
    descLower.includes("aldi")
  ) {
    return "Groceries";
  }

  if (
    descLower.includes("7-eleven") ||
    descLower.includes("7 eleven") ||
    descLower.includes("7/11") ||
    descLower.includes("bp") ||
    descLower.includes("caltex") ||
    descLower.includes("ampol") ||
    descLower.includes("shell")
  ) {
    return "Fuel";
  }

  if (
    descLower.includes("netflix") ||
    descLower.includes("spotify") ||
    descLower.includes("disney+") ||
    descLower.includes("bingewatch") ||
    descLower.includes("optus") ||
    descLower.includes("telstra") ||
    descLower.includes("vodafone") ||
    descLower.includes("amaysim")
  ) {
    return "Subscriptions";
  }

  if (
    descLower.includes("uber") ||
    descLower.includes("ola") ||
    descLower.includes("didi") ||
    descLower.includes("taxi")
  ) {
    return "Transport";
  }

  if (
    descLower.includes("kmart") ||
    descLower.includes("k-mart") ||
    descLower.includes("jb hi-fi") ||
    descLower.includes("officeworks") ||
    descLower.includes("harvey norman") ||
    descLower.includes("amazon")
  ) {
    return "Shopping";
  }

  // 3. Default fallback
  return "Uncategorized";
}
