"use client";

import { deleteWebsite } from "@/app/(dashboard)/settings/actions";

export function DeleteWebsiteButton({
  websiteId,
  websiteName,
}: {
  websiteId: string;
  websiteName: string;
}) {
  return (
    <form
      action={deleteWebsite}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete ${websiteName}? Its visitors, sessions, and page views will be permanently deleted.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="websiteId" type="hidden" value={websiteId} />
      <button
        className="rounded-full border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
        type="submit"
      >
        Delete website
      </button>
    </form>
  );
}
