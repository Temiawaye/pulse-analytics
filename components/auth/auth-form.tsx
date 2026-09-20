"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthFormState } from "@/app/(auth)/actions";

interface AuthFormProps {
  action: (state: AuthFormState, data: FormData) => Promise<AuthFormState>;
  mode: "login" | "register";
}

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const registering = mode === "register";
  return (
    <form action={formAction} className="mt-8 space-y-5">
      {registering && <Field label="Name" name="name" autoComplete="name" />}
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={registering ? "new-password" : "current-password"}
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        className="button-primary w-full justify-center"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : registering ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        {registering ? "Already registered? " : "New to Pulse? "}
        <Link
          className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
          href={registering ? "/login" : "/register"}
        >
          {registering ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium text-slate-800"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={type === "password" ? 8 : undefined}
      />
    </div>
  );
}
