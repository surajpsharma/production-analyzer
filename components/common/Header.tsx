"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Shelling Missing", href: "/shelling" },
    { name: "Printing Missing", href: "/printing" },
  ];

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="rounded-lg bg-blue-600 p-2">
            <ScanSearch className="h-6 w-6 text-white" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Production Analyzer
            </h1>
            <p className="text-xs text-slate-500">
              Shelling & Printing Missing Finder
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-all hover:bg-slate-50",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}