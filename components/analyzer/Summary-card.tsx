import * as React from "react";
import { ClipboardCheck, CheckCircle2, AlertTriangle, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalChecked: number;
  matched: number;
  missing: number;
  preparedBy: string;
}

export default function SummaryCards({
  totalChecked,
  matched,
  missing,
  preparedBy,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Checked",
      value: totalChecked,
      description: "Cases filtered by date and prepared by",
      icon: ClipboardCheck,
      color: "blue",
      bgColor: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Matched Cases",
      value: matched,
      description: "Existing in Dashboard Excel",
      icon: CheckCircle2,
      color: "green",
      bgColor: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      title: "Missing Cases",
      value: missing,
      description: "NOT existing in Dashboard Excel",
      icon: AlertTriangle,
      color: "red",
      bgColor: "bg-rose-50 text-rose-600",
      borderColor: "border-rose-100",
    },
    {
      title: "Prepared By",
      value: preparedBy || "N/A",
      description: "User who prepared the batch",
      icon: UserCheck,
      color: "indigo",
      bgColor: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-100",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-200"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{card.title}</span>
              <div className={cn("rounded-xl p-2.5", card.bgColor)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
