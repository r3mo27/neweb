import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <div className="w-full max-w-[560px]">
        <span className="r-tab mono inline-block bg-navy px-4 pb-1.5 pt-2 text-[11px] text-cream">
          404 · carpeta perdida
        </span>
        <div className="r bg-navy p-3" style={{ borderTopLeftRadius: 0 }}>
          <div className="r-sm bg-pink p-8">
            <h1 className="display text-[clamp(2.6rem,9vw,4.4rem)] text-ink">
              Esta carpeta no está en el cajón.
            </h1>
            <Link
              href="/"
              className="focus-ring mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-cream"
            >
              Volver a rem0 ↑
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
