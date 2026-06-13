import Image from "next/image";

export const metadata = { title: "Bekreftet · Helt Shpa Spa" };

export default function BekreftetSide() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10 min-h-screen">
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <Image src="/bak_bilde.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-md w-full bg-paper rounded-3xl px-8 py-12 sm:px-10 text-center">
        <Image
          src="/HSS_LOGO.svg"
          alt="Helt Shpa Spa"
          width={781}
          height={310}
          className="mx-auto w-48"
        />
        <h1 className="font-heading font-semibold text-3xl mt-8">Bestillingen er bekreftet</h1>
        <p className="mt-4 text-ink-soft leading-relaxed">
          Gjesten har fått beskjed på e-post. Takk for at du driver byens
          hyggeligste spa. 💆
        </p>
      </div>
    </main>
  );
}
