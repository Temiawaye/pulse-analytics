"use client";

import { useEffect, useState } from "react";

import { deleteWebsite } from "@/app/(dashboard)/websites/actions";

export function DeleteWebsiteButton({
  websiteId,
  websiteName,
}: {
  websiteId: string;
  websiteName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700"
        type="button"
        onClick={() => setOpen(true)}
        title={`Delete ${websiteName}`}
      >
        <span className="sr-only">Delete {websiteName}</span>
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 3h6m-8 4h10m-9 0 .6 12h6.8L16 7M10 10v6m4-6v6"
          />
        </svg>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={() => setOpen(false)}
        >
          <div
            aria-describedby="delete-description"
            aria-labelledby="delete-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            role="alertdialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="grid size-11 place-items-center rounded-full bg-red-100 text-red-700">
              <svg
                aria-hidden="true"
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 4.4 3.5 17a2 2 0 0 0 1.8 3h13.4a2 2 0 0 0 1.8-3L13.7 4.4a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </div>
            <h2
              className="mt-4 text-xl font-semibold text-slate-950"
              id="delete-title"
            >
              Delete {websiteName}?
            </h2>
            <p
              className="mt-2 text-sm leading-6 text-slate-600"
              id="delete-description"
            >
              All visitors, sessions, page views, and tracking data for this
              website will be permanently deleted. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                autoFocus
                className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <form action={deleteWebsite}>
                <input name="websiteId" type="hidden" value={websiteId} />
                <button
                  className="rounded-full bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                  type="submit"
                >
                  Delete website
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
