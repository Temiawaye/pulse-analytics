"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/require-user";
import { websiteSchema } from "@/lib/validation/website";

export async function saveWebsite(formData: FormData) {
  const user = await requireUser();
  const parsed = websiteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/settings?error=invalid");
  const websiteId = formData.get("websiteId");
  if (typeof websiteId === "string" && websiteId) {
    const result = await db.website.updateMany({
      where: { id: websiteId, userId: user.id },
      data: parsed.data,
    });
    if (!result.count) redirect("/settings?error=not-found");
    revalidatePath("/settings");
    redirect(`/settings?website=${websiteId}&saved=1`);
  }
  const website = await db.website.create({
    data: {
      ...parsed.data,
      userId: user.id,
      trackingId: `site_${randomBytes(12).toString("base64url")}`,
    },
  });
  revalidatePath("/settings");
  redirect(`/settings?website=${website.id}&created=1`);
}
