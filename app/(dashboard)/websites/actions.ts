"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db/client";
import { websiteSchema } from "@/lib/validation/website";

export async function createWebsite(formData: FormData) {
  const user = await requireUser();
  const parsed = websiteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/websites?error=invalid");

  const website = await db.website.create({
    data: {
      ...parsed.data,
      userId: user.id,
      trackingId: `site_${randomBytes(12).toString("base64url")}`,
    },
  });
  revalidatePath("/", "layout");
  redirect(`/websites?created=${website.id}`);
}

export async function deleteWebsite(formData: FormData) {
  const user = await requireUser();
  const websiteId = formData.get("websiteId");
  if (typeof websiteId !== "string" || !websiteId) {
    redirect("/websites?error=invalid");
  }

  const result = await db.website.deleteMany({
    where: { id: websiteId, userId: user.id },
  });
  if (!result.count) redirect("/websites?error=not-found");

  revalidatePath("/", "layout");
  redirect("/websites?deleted=1");
}
