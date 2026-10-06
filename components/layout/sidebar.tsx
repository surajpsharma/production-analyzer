"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Shelling Missing", href: "/shelling" },
  { name: "Printing Missing", href: "/printing" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white">
      <div className="border-b p-6 flex flex-col items-center">
        <Image
          src="https://asset2.toothsi.in/makeo_logo_transparent_copy_4fbd0574d4.svg"
          alt="makeO toothsi logo"
          width={150}
          height={40}
          className="h-10 w-auto mb-2"
        />
        <h1 className="text-sm font-bold text-slate-800 tracking-wide mt-2">
          PRODUCTION ANALYZER
        </h1>
        <p className="mt-1 text-xs text-slate-400 font-medium tracking-widest uppercase">
          Internal Tool
        </p>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mb-2 block rounded-lg px-4 py-3 transition ${pathname === item.href
                ? "bg-[#e03c31] text-white shadow-md shadow-[#e03c31]/20 font-medium"
                : "text-slate-600 hover:bg-[#f9e9e8] hover:text-[#e03c31]"
              }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}