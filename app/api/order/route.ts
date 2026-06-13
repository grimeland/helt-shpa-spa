import { NextResponse } from "next/server";
import { Resend } from "resend";
import { MENU, MAX_ANTALL, OrderLine, antallTotalt } from "@/lib/menu";
import { buildOrderEmail, SITE_URL } from "@/lib/email";
import { encodePayload } from "@/lib/confirm";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || typeof body.navn !== "string" || !body.navn.trim()) {
    return NextResponse.json({ error: "Ugyldig bestilling" }, { status: 400 });
  }

  const mottaker: "eline" | "erlend" = body.mottaker === "eline" ? "eline" : "erlend";
  const to = mottaker === "eline" ? process.env.EMAIL_ELINE : process.env.EMAIL_ERLEND;

  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "RESEND_API_KEY, EMAIL_ELINE og EMAIL_ERLEND må settes i .env.local" },
      { status: 500 }
    );
  }

  const lines: OrderLine[] = [];
  for (const raw of body.items) {
    const item = MENU.find((i) => i.id === raw?.id);
    const antall = Number(raw?.antall);
    if (!item || !Number.isInteger(antall) || antall < 1 || antall > MAX_ANTALL) continue;
    if (lines.some((l) => l.item.id === item.id)) continue;
    lines.push({ item, antall });
  }
  const egne: [string, number][] = [];
  if (Array.isArray(body.egne)) {
    for (const raw of body.egne) {
      const name = typeof raw?.name === "string" ? raw.name.trim().slice(0, 60) : "";
      const antall = Number(raw?.antall);
      if (!name || !Number.isInteger(antall) || antall < 1 || antall > MAX_ANTALL) continue;
      if (egne.length >= 10) break;
      egne.push([name, antall]);
      lines.push({ item: { id: `egen-${egne.length}`, name }, antall });
    }
  }
  if (lines.length === 0) {
    return NextResponse.json({ error: "Ingen gyldige tjenester valgt" }, { status: 400 });
  }

  const navn = body.navn.trim().slice(0, 100);
  const tidspunkt = typeof body.tidspunkt === "string" ? body.tidspunkt.trim().slice(0, 200) : "";
  const betaling: string[] = Array.isArray(body.betaling)
    ? body.betaling
        .filter((t: unknown): t is string => typeof t === "string")
        .map((t: string) => t.trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, 10)
    : [];
  const melding = typeof body.melding === "string" ? body.melding.trim().slice(0, 1000) : "";

  const totalt = antallTotalt(lines);
  const confirmUrl = `${SITE_URL}/bekreft?d=${encodePayload({
    navn,
    tidspunkt,
    betaling,
    melding,
    items: lines.filter((l) => !l.item.id.startsWith("egen-")).map((l) => [l.item.id, l.antall]),
    egne,
    svarTil: mottaker === "eline" ? "erlend" : "eline",
  })}`;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL ?? "Helt Shpa Spa <onboarding@resend.dev>",
    to,
    subject: `🍫 Ny bestilling fra ${navn} · ${totalt} ${totalt === 1 ? "behandling" : "behandlinger"}`,
    html: buildOrderEmail({ lines, navn, tidspunkt, betaling, melding, confirmUrl }),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
