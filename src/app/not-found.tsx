"use client";

import Link from "next/link";
import { useSite } from "@/components/Providers";

export default function NotFound() {
  const { t } = useSite();
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <div className="w-full max-w-[560px]">
        <span className="r-tab mono inline-block bg-navy px-4 pb-1.5 pt-2 text-[11px] text-cream">
          {t.notFound.tab}
        </span>
        <div className="r bg-navy p-3" style={{ borderTopLeftRadius: 0 }}>
          <div className="r-sm bg-pink p-8">
            <h1 className="display text-[clamp(2.6rem,9vw,4.4rem)] text-ink">{t.notFound.title}</h1>
            <Link
              href="/"
              className="focus-ring mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-cream"
            >
              {t.notFound.back}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
