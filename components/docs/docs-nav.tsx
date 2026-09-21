"use client";

import { useEffect, useState } from "react";

export const docsNavigation = [
  ["getting-started", "Getting started"],
  ["connect", "Connect your website"],
  ["install", "Install tracking script"],
  ["frameworks", "Framework guides"],
  ["events", "Sending events"],
  ["custom-events", "Custom events"],
  ["verify", "Verify connection"],
  ["troubleshooting", "Troubleshooting"],
] as const;

export function DocsNav() {
  const [active, setActive] = useState(docsNavigation[0][0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id as typeof active);
      },
      { rootMargin: "-15% 0px -70%", threshold: [0, 0.25, 0.75] },
    );
    docsNavigation.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        On this page
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {docsNavigation.map(([id, label]) => (
          <li key={id}>
            <a
              className={`block whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors lg:border-0 lg:border-l-2 lg:rounded-none ${
                active === id
                  ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                  : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-slate-950"
              }`}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
