"use server";

import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db/client";

export type ConnectionState = {
  status: "idle" | "waiting" | "receiving" | "error";
  message: string;
  checkedAt?: string;
};

export async function verifyConnection(
  _previous: ConnectionState,
  formData: FormData,
): Promise<ConnectionState> {
  const websiteId = formData.get("websiteId");
  if (typeof websiteId !== "string" || !websiteId) {
    return { status: "error", message: "Select a website before checking." };
  }

  try {
    const user = await requireUser();
    const website = await db.website.findFirst({
      where: { id: websiteId, userId: user.id },
      select: {
        pageViews: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    if (!website) {
      return {
        status: "error",
        message: "This website could not be verified.",
      };
    }

    const lastEvent = website.pageViews[0];
    return lastEvent
      ? {
          status: "receiving",
          message: `Receiving events. Last page view: ${lastEvent.createdAt.toLocaleString()}.`,
          checkedAt: new Date().toISOString(),
        }
      : {
          status: "waiting",
          message:
            "Waiting for data. Open the website, visit a page, then check again.",
          checkedAt: new Date().toISOString(),
        };
  } catch {
    return {
      status: "error",
      message: "Connection check failed. Please try again.",
      checkedAt: new Date().toISOString(),
    };
  }
}
