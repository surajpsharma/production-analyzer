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
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
        {icon === "shelling" ? (
          <ScanSearch className="h-7 w-7 text-blue-600" />
        ) : (
          <Printer className="h-7 w-7 text-blue-600" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-3 text-slate-600">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 font-medium text-blue-600">
        Open Analyzer
        <ArrowRight size={18} />
      </div>
    </Link>
  );
}