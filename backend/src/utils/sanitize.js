const validator = require("validator");

function cleanString(value, max = 2000) {
  if (typeof value !== "string") return "";
  return validator.escape(value.trim().slice(0, max));
}

function cleanPlainString(value, max = 2000) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function cleanArray(values, maxItems = 20, maxLength = 80) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => cleanPlainString(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function isSafeUrl(value) {
  return typeof value === "string" && validator.isURL(value, { require_protocol: true, protocols: ["http", "https"] });
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

module.exports = {
  cleanString,
  cleanPlainString,
  cleanArray,
  isSafeUrl,
  isHexColor,
};
