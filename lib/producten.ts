import type { ProductItem } from "@/lib/types";

/**
 * Validates and maps the product list n8n sends, e.g.
 * [{ "name": "sushi rol", "amount": 1, "price": 12.95 }]
 * into the structured shape stored in the `producten` jsonb column.
 */
export function parseProducten(raw: unknown): ProductItem[] {
  // n8n collapses a single-item array to a bare object in some node
  // configurations — accept that shape too rather than rejecting it.
  const list = Array.isArray(raw) ? raw : [raw];

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
