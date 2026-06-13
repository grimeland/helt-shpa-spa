import { MENU } from "@/lib/menu";
import { buildOrderEmail } from "@/lib/email";

// Forhåndsvisning av bestillings-e-posten: åpne /epost i nettleseren
export function GET() {
  const find = (id: string) => MENU.find((i) => i.id === id)!;
  const html = buildOrderEmail({
    lines: [
      { item: find("hodebunn"), antall: 2 },
      { item: find("fotbad"), antall: 1 },
      { item: find("rygg"), antall: 1 },
    ],
    navn: "Erlend",
    tidspunkt: "Søndag kveld",
    betaling: ["Sjokolade 🍫", "En god klem"],
    melding: "Gleder meg!",
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
