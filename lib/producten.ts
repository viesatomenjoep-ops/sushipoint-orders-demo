import type { ProductItem } from "@/lib/types";

const ITEM_PATTERN = /^(\d+)\s*x\s*(.+)$/i;

/**
 * Parses the free-text product list n8n sends, e.g.
 * "1x The Box - Gold , 2x Coca Cola Zero , 3x Extra sojasaus"
 * into the structured shape stored in the `producten` jsonb column.
 */
export function parseProducten(raw: string): ProductItem[] {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error("producten is empty");
  }

  return parts.map((part) => {
    const match = part.match(ITEM_PATTERN);
    if (!match) {
      throw new Error(`Could not parse product entry: "${part}"`);
    }
    const [, aantal, naam] = match;
    return { naam: naam.trim(), aantal: Number(aantal) };
  });
}
