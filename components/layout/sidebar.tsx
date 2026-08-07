"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Shelling Missing", href: "/shelling" },
  { name: "Printing Missing", href: "/printing" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold text-blue-600">
          Production Analyzer
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Internal Tool
        </p>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mb-2 block rounded-lg px-4 py-3 transition ${pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-100"
              }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}