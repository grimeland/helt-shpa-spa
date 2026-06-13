import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildConfirmedEmail, SITE_URL } from "@/lib/email";
import { decodePayload, payloadTilLinjer } from "@/lib/confirm";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  const form = await request.formData().catch(() => null);
  const d = form?.get("d");
  const payload = typeof d === "string" ? decodePayload(d) : null;
  const lines = payload ? payloadTilLinjer(payload) : [];

  if (!payload || lines.length === 0) {
    return NextResponse.json({ error: "Ugyldig bekreftelseslenke" }, { status: 400 });
  }

  const to = payload.svarTil === "eline" ? process.env.EMAIL_ELINE : process.env.EMAIL_ERLEND;
  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "RESEND_API_KEY, EMAIL_ELINE og EMAIL_ERLEND må settes" },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL ?? "Helt Shpa Spa <onboarding@resend.dev>",
    to,
    subject: `✨ Helt Shpa Spa har bekreftet bestillingen din`,
    html: buildConfirmedEmail({
      lines,
      navn: payload.navn,
      tidspunkt: payload.tidspunkt,
      betaling: payload.betaling,
    }),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.redirect(`${SITE_URL}/bekreftet`, 303);
}
