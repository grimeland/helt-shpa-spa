import { MENU, MAX_ANTALL, OrderLine } from "./menu";

/** Bestillingen reiser med i bekreftelseslenken – ingen database */
export type ConfirmPayload = {
  navn: string;
  tidspunkt: string;
  betaling: string[];
  melding: string;
  items: [string, number][];
  /** Egne menyvalg som ikke finnes i MENU: [navn, antall] */
  egne?: [string, number][];
  /** Hvem som skal få bekreftelses-e-posten (den som bestilte) */
  svarTil?: "eline" | "erlend";
};

export function encodePayload(p: ConfirmPayload): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

export function decodePayload(d: string): ConfirmPayload | null {
  try {
    const raw = JSON.parse(Buffer.from(d, "base64url").toString("utf8"));
    if (typeof raw?.navn !== "string" || !Array.isArray(raw?.items)) return null;
    return {
      navn: raw.navn.slice(0, 100),
      tidspunkt: typeof raw.tidspunkt === "string" ? raw.tidspunkt.slice(0, 200) : "",
      betaling: Array.isArray(raw.betaling)
        ? raw.betaling
            .filter((t: unknown): t is string => typeof t === "string")
            .map((t: string) => t.slice(0, 60))
            .slice(0, 10)
        : [],
      melding: typeof raw.melding === "string" ? raw.melding.slice(0, 1000) : "",
      items: raw.items,
      egne: Array.isArray(raw.egne) ? raw.egne : [],
      svarTil: raw.svarTil === "eline" ? "eline" : "erlend",
    };
  } catch {
    return null;
  }
}

export function payloadTilLinjer(p: ConfirmPayload): OrderLine[] {
  const lines: OrderLine[] = [];
  for (const [id, antall] of p.items) {
    const item = MENU.find((i) => i.id === id);
    if (!item || !Number.isInteger(antall) || antall < 1 || antall > MAX_ANTALL) continue;
    if (lines.some((l) => l.item.id === item.id)) continue;
    lines.push({ item, antall });
  }
  for (const [name, antall] of p.egne ?? []) {
    if (typeof name !== "string" || !name.trim()) continue;
    if (!Number.isInteger(antall) || antall < 1 || antall > MAX_ANTALL) continue;
    lines.push({ item: { id: `egen-${lines.length}`, name: name.trim().slice(0, 60) }, antall });
  }
  return lines;
}
