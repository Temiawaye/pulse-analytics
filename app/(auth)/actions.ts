"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { db } from "@/lib/db/client";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export type AuthFormState = { error?: string };

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/overview" });
  } catch (error) {
    if (error instanceof AuthError)
      return { error: "Invalid email or password." };
    throw error;
  }
  return {};
}

export async function register(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: "Check your name, email, and password." };
  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: "An account with this email already exists." };
  }
  await db.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hash(parsed.data.password, 12),
    },
  });
  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: "/settings",
  });
  redirect("/settings");
}
