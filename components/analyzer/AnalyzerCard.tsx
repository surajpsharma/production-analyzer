import Link from "next/link";
import { ArrowRight, ScanSearch, Printer } from "lucide-react";

interface AnalyzerCardProps {
  title: string;
  description: string;
  href: string;
  icon: "shelling" | "printing";
}

export default function AnalyzerCard({
  title,
  description,
  href,
  icon,
}: AnalyzerCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-[#f9e9e8] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#e03c31]/10"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f9e9e8] transition-colors duration-300 group-hover:bg-[#e03c31]">
        {icon === "shelling" ? (
          <ScanSearch className="h-8 w-8 text-[#e03c31] transition-colors duration-300 group-hover:text-white" />
        ) : (
          <Printer className="h-8 w-8 text-[#e03c31] transition-colors duration-300 group-hover:text-white" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        {title}
      </h2>

      <p className="text-slate-500 leading-relaxed min-h-[3rem]">
        {description}
      </p>

      <div className="mt-8 flex items-center gap-2 font-semibold text-[#e03c31] transition-transform duration-300 group-hover:translate-x-1">
        Open Analyzer
        <ArrowRight size={20} />
      </div>
    </Link>
  );
}