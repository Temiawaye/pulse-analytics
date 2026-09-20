export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        {children}
      </div>
    </main>
  );
}
