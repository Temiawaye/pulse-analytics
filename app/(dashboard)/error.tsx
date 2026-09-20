"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <section aria-labelledby="error-title" className="max-w-xl">
      <span className="eyebrow">Dashboard error</span>
      <h1 className="mt-3 text-3xl font-semibold" id="error-title">
        We couldn&apos;t load this view.
      </h1>
      <p className="mt-3 text-slate-600">
        Try the request again. If the problem continues, check the application
        configuration.
      </p>
      <button className="button-primary mt-6" onClick={reset} type="button">
        Try again
      </button>
    </section>
  );
}
