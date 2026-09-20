import { db } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/require-user";
import { saveWebsite } from "./actions";

export default async function SettingsPage({
  searchParams,
}: PageProps<"/settings">) {
  const user = await requireUser();
  const params = await searchParams;
  const website =
    typeof params.website === "string"
      ? await db.website.findFirst({
          where: { id: params.website, userId: user.id },
        })
      : null;
  return (
    <section className="max-w-2xl">
      <span className="eyebrow">Configuration</span>
      <h1 className="mt-3 text-3xl font-semibold">
        {website ? "Website settings" : "Add a website"}
      </h1>
      <p className="mt-3 text-slate-600">
        Register the exact hostname that will send analytics events.
      </p>
      <form
        action={saveWebsite}
        className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
      >
        {website && <input type="hidden" name="websiteId" value={website.id} />}
        <Field
          name="name"
          label="Website name"
          defaultValue={website?.name}
          placeholder="My portfolio"
        />
        <Field
          name="domain"
          label="Domain"
          defaultValue={website?.domain}
          placeholder="example.com"
        />
        <button className="button-primary" type="submit">
          {website ? "Save changes" : "Create website"}
        </button>
      </form>
      {website && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Public tracking ID</h2>
          <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-950 p-3 text-sm text-emerald-300">
            {website.trackingId}
          </code>
        </div>
      )}
    </section>
  );
}
function Field({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
      />
    </div>
  );
}
