import type { ProductItem } from "@/lib/types";

/**
 * Validates and maps the product list n8n sends, e.g.
 * [{ "name": "sushi rol", "amount": 1, "price": 12.95 }]
 * into the structured shape stored in the `producten` jsonb column.
 */
function isIndexKeyedObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key, i) => key === String(i));
}

export function parseProducten(raw: unknown): ProductItem[] {
  // n8n collapses a single-item array to a bare object in some node
  // configurations — accept that shape too rather than rejecting it.
  // It can also turn a multi-item array into an object keyed by index
  // (e.g. { "0": {...}, "1": {...} }) — unwrap that back into an array.
  const list = Array.isArray(raw)
    ? raw
    : isIndexKeyedObject(raw)
      ? Object.values(raw)
      : [raw];

  if (list.length === 0) {
    throw new Error("producten is empty");
  }

  return list.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`producten[${index}] must be an object`);
    }

    const { name, amount, price } = item as Record<string, unknown>;

    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(`producten[${index}].name must be a non-empty string`);
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      throw new Error(`producten[${index}].amount must be a positive number`);
    }

    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      throw new Error(`producten[${index}].price must be a non-negative number`);
    }

    return { naam: name.trim(), aantal: amount, prijs: price };
  });
}
