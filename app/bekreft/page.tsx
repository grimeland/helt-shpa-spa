import Image from "next/image";
import { decodePayload, payloadTilLinjer } from "@/lib/confirm";

export const metadata = { title: "Bekreft bestilling · Helt Shpa Spa" };

export default async function BekreftSide({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const payload = d ? decodePayload(d) : null;
  const linjer = payload ? payloadTilLinjer(payload) : [];

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10 min-h-screen">
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <Image src="/bak_bilde.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-md w-full bg-paper rounded-3xl px-8 py-10 sm:px-10 text-center">
        <Image
          src="/HSS_LOGO.svg"
          alt="Helt Shpa Spa"
          width={781}
          height={310}
          className="mx-auto w-48"
        />

        {!payload || linjer.length === 0 ? (
          <p className="mt-8 text-ink-soft">
            Fant ikke bestillingen – lenken ser ut til å være ufullstendig.
          </p>
        ) : (
          <>
            <h1 className="font-heading font-semibold text-2xl mt-8">
              Bestilling fra {payload.navn}
            </h1>
            {payload.tidspunkt && (
              <p className="mt-1 text-ink-soft">Ønsket tidspunkt: {payload.tidspunkt}</p>
            )}

            <ul className="mt-6 space-y-2 text-left">
              {linjer.map((l) => (
                <li key={l.item.id} className="flex items-baseline gap-3">
                  <span className="font-display">
                    {l.antall} × {l.item.name}
                  </span>
                  <span className="flex-1 border-b-2 border-dotted border-ink-soft/40 translate-y-[-4px]" />
                </li>
              ))}
            </ul>

            {payload.betaling.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {payload.betaling.map((t) => (
                  <span key={t} className="rounded-full bg-glow px-4 py-2 text-sm">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {payload.melding && (
              <p className="mt-6 font-display italic text-ink-soft">«{payload.melding}»</p>
            )}

            <form action="/api/confirm" method="POST" className="mt-8">
              <input type="hidden" name="d" value={d} />
              <button
                type="submit"
                className="w-full rounded-full bg-cta text-cream px-8 py-4 text-lg font-heading font-semibold hover:bg-cta-deep transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta-deep"
              >
                Bekreft bestilling
              </button>
            </form>
            <p className="mt-4 text-sm text-ink-soft">
              Gjesten får beskjed på e-post når du bekrefter.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
