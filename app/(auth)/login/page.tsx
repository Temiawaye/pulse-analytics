import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { login } from "../actions";
export default async function LoginPage() {
  if ((await auth())?.user) redirect("/overview");
  return (
    <>
      <span className="eyebrow">Welcome back</span>
      <h1 className="mt-3 text-[2rem] font-semibold tracking-tight">Sign in</h1>
      <AuthForm action={login} mode="login" />
    </>
  );
}
