import Link from "next/link";

export function EmptyState({
  title,
  message,
  setup = false,
}: {
  title: string;
  message: string;
  setup?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {message}
      </p>
      {setup && (
        <Link className="button-primary mt-5 inline-flex" href="/websites">
          Add a website
        </Link>
      )}
    </div>
  );
}
