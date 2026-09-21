import Link from "next/link";

const navigation = [
  { href: "/overview", label: "Overview" },
  { href: "/pages", label: "Pages" },
  { href: "/visitors", label: "Visitors" },
  { href: "/sources", label: "Sources" },
  { href: "/docs", label: "Integration guide" },
  { href: "/settings", label: "Settings" },
];

export function DashboardNav() {
  return (
    <nav aria-label="Dashboard" className="overflow-x-auto lg:overflow-visible">
      <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
        {navigation.map((item) => (
          <li key={item.href}>
            <Link
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
