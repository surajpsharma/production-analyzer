"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

import Image from "next/image";

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
          <div className="flex items-center">
            <Image
              src="https://asset2.toothsi.in/makeo_logo_transparent_copy_4fbd0574d4.svg"
              alt="makeO toothsi logo"
              width={100}
              height={30}
              className="h-8 w-auto"
            />
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
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#e03c31] text-white shadow-md shadow-[#e03c31]/25"
                    : "text-slate-600 hover:bg-[#f9e9e8] hover:text-[#e03c31]"
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