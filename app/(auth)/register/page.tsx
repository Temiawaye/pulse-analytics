import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { register } from "../actions";
export default async function RegisterPage() {
  if ((await auth())?.user) redirect("/overview");
  return (
    <>
      <span className="eyebrow">Get started</span>
      <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use at least eight characters for your password.
      </p>
      <AuthForm action={register} mode="register" />
    </>
  );
}
