"use client";

import { Icon } from "@iconify/react";
import dangerIcon from "@iconify-icons/solar/danger-triangle-linear";
import trashIcon from "@iconify-icons/solar/trash-bin-trash-linear";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="rounded-lg text-slate-400  hover:text-red-700"
        type="button"
        onClick={() => setOpen(true)}
        title={`Delete ${websiteName}`}
      >
        <span className="sr-only">Delete {websiteName}</span>
        <Icon aria-hidden="true" className="size-5" icon={trashIcon} />
      </button>
      {open &&
        createPortal(
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
                <Icon aria-hidden="true" className="size-6" icon={dangerIcon} />
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
                website will be permanently deleted. This action cannot be
                undone.
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
          </div>,
          document.body,
        )}
    </>
  );
}
