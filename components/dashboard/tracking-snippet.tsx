"use client";

import { useState } from "react";

export function TrackingSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300">
        <code>{code}</code>
      </pre>
      <button
        className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied" : "Copy snippet"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Tracking snippet copied" : ""}
      </span>
    </div>
  );
}
