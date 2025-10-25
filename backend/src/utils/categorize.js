// simple keyword matcher for first version
export function categorizeDescription(desc) {
  if (!desc || typeof desc !== "string") return "Uncategorized";

  const d = desc.toLowerCase();

  if (d.includes("uber eats") || d.includes("doordash") || d.includes("menulog")) {
    return "Food Delivery";
  }
  if (d.includes("mcdonald") || d.includes("kfc") || d.includes("restaurant")) {
    return "Eating Out";
  }
  if (d.includes("coles") || d.includes("woolworths") || d.includes("aldi")) {
    return "Groceries";
  }
  if (d.includes("7-eleven") || d.includes("7 eleven") || d.includes("bp") || d.includes("caltex")) {
    return "Fuel";
  }
  if (d.includes("netflix") || d.includes("spotify") || d.includes("telstra") || d.includes("optus")) {
    return "Subscriptions";
  }
  if (d.includes("uber") || d.includes("ola") || d.includes("diDi") || d.includes("taxi")) {
    return "Transport";
  }

  return "Uncategorized";
}
