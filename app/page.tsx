import { Icon } from "@iconify/react";
import arrowRightIcon from "@iconify-icons/solar/arrow-right-linear";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <section className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Pulse Analytics</span>
        <h1 className="mt-5 text-balance text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-7xl">
          Website analytics without the noise.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
          Understand visits, pages, and traffic sources with a focused,
          privacy-minded dashboard.
        </p>
        <Link className="button-primary mt-9 inline-flex" href="/overview">
          Open dashboard
          <Icon aria-hidden="true" icon={arrowRightIcon} className="size-4" />
        </Link>
      </section>
    </main>
  );
}
