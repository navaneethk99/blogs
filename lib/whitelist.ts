const rawWhitelist = process.env.BLOGS_WHITELIST ?? "";

const normalized = rawWhitelist
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

const whitelistSet = new Set(normalized);

export const isWhitelisted = (value?: string | null) => {
  if (!value) return false;
  return whitelistSet.has(value.trim().toLowerCase());
};
