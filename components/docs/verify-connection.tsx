"use client";

import { useActionState } from "react";

import {
  type ConnectionState,
  verifyConnection,
} from "@/app/(dashboard)/docs/actions";

const initialState: ConnectionState = {
  status: "idle",
  message: "Run a live check after visiting your website.",
};

export function VerifyConnection({ websiteId }: { websiteId: string }) {
  const [state, action, pending] = useActionState(
    verifyConnection,
    initialState,
  );
  const tone =
    state.status === "receiving"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : state.status === "error"
        ? "border-red-200 bg-red-50 text-red-900"
        : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <form action={action} className="mt-5">
      <input name="websiteId" type="hidden" value={websiteId} />
      <div
        className={`rounded-xl border p-4 ${tone}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">
              {state.status === "receiving"
                ? "Receiving events"
                : state.status === "error"
                  ? "Connection error"
                  : "Waiting for data"}
            </p>
            <p className="mt-1 text-sm opacity-80">{state.message}</p>
          </div>
          <button
            className="button-primary shrink-0 text-sm disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Checking…" : "Verify connection"}
          </button>
        </div>
      </div>
    </form>
  );
}
