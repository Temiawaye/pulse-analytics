interface PagePlaceholderProps {
  description: string;
  eyebrow: string;
  title: string;
}

export function PagePlaceholder({
  description,
  eyebrow,
  title,
}: PagePlaceholderProps) {
  return (
    <section aria-labelledby="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1
        className="mt-3 text-3xl font-semibold tracking-tight text-slate-950"
        id="page-title"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        {description}
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-700">
          This workspace is ready for live analytics data.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Database-backed content will be added in the analytics implementation
          phases.
        </p>
      </div>
    </section>
  );
}
