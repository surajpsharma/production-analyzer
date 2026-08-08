"use client";

import { useState, useEffect } from "react";
import UploadBox from "./Upload-box";
import SummaryCards from "./Summary-card";
import ResultTable from "./Result-table";
import { Input } from "@/components/common/Input";
import { Loader2, Play, AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseBacklogMetadata, performAnalysis } from "@/lib/excelProcessor";

interface AnalyzerFormProps {
  title: string;
  dashboardLabel: string;
  apiEndpoint: string;
  buttonText: string;
}

export default function AnalyzerForm({
  title,
  dashboardLabel,
  apiEndpoint,
  buttonText,
}: AnalyzerFormProps) {
  const [monthlyFile, setMonthlyFile] = useState<File | null>(null);
  const [dashboardFile, setDashboardFile] = useState<File | null>(null);

  const [date, setDate] = useState("");
  const [preparedBy, setPreparedBy] = useState("");

  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  
  // Results states
  const [totalChecked, setTotalChecked] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [missingCount, setMissingCount] = useState(0);
  const [missingCases, setMissingCases] = useState<any[]>([]);
  const [reportData, setReportData] = useState<string | undefined>(undefined);
  const [reportFilename, setReportFilename] = useState<string | undefined>(undefined);

  // Auto-parsing state
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableOperators, setAvailableOperators] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Trigger parsing when monthlyFile changes
  useEffect(() => {
    if (!monthlyFile) {
      setAvailableDates([]);
      setAvailableOperators([]);
      setDate("");
      setPreparedBy("");
      return;
    }

    const parseBacklogFile = async () => {
      try {
        setIsParsing(true);
        const arrayBuffer = await monthlyFile.arrayBuffer();
        const data = parseBacklogMetadata(arrayBuffer);
        
        if (data.success) {
          setAvailableDates(data.dates || []);
          setAvailableOperators(data.operators || []);
          
          // Autofill defaults if available
          if (data.dates && data.dates.length > 0) {
            setDate(data.dates[0]);
          }
          if (data.operators && data.operators.length > 0) {
            setPreparedBy(""); // Reset to empty to force explicit selection
          }
          showToast("Backlog parsed successfully! Select date and operator.", "info");
        } else {
          showToast((data as any).error || "Failed to parse backlog metadata.", "error");
        }
      } catch (err: any) {
        console.error("Metadata parsing error:", err);
        showToast(err.message || "Failed to parse backlog metadata.", "error");
        // Reset to manual inputs
        setAvailableDates([]);
        setAvailableOperators([]);
      } finally {
        setIsParsing(false);
      }
    };

    parseBacklogFile();
  }, [monthlyFile]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const analyze = async () => {
    if (!monthlyFile || !dashboardFile) {
      showToast("Please upload both Monthly Backlog and Dashboard files.", "error");
      return;
    }

    if (!date) {
      showToast("Please select a Printing Done Date.", "error");
      return;
    }

    if (!preparedBy.trim()) {
      showToast("Please enter who prepared the sheet.", "error");
      return;
    }

    try {
      setLoading(true);
      setHasRun(false);

      const monthlyBuffer = await monthlyFile.arrayBuffer();
      const dashboardBuffer = await dashboardFile.arrayBuffer();
      const analysisType = apiEndpoint.endsWith("printing") ? "printing" : "shelling";

      const data = performAnalysis(
        monthlyBuffer,
        dashboardBuffer,
        date,
        preparedBy,
        analysisType
      );

      if (data.success) {
        setTotalChecked(data.total_checked);
        setMatchedCount(data.matched);
        setMissingCount(data.missing);
        setMissingCases(data.missing_cases || []);
        setReportData(data.report_data);
        setReportFilename(data.report_filename);
        setHasRun(true);

        showToast(
          `Analysis complete! Found ${data.missing} missing case${data.missing === 1 ? "" : "s"}.`,
          "success"
        );
      } else {
        showToast(data.error || "Analysis failed.", "error");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      showToast(err.message || "Failed to run analysis.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Alert */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg border backdrop-blur-sm transition-all duration-300 transform translate-y-0",
            toast.type === "success" && "bg-emerald-50/95 border-emerald-200 text-emerald-950",
            toast.type === "error" && "bg-rose-50/95 border-rose-200 text-rose-950",
            toast.type === "info" && "bg-blue-50/95 border-blue-200 text-blue-950"
          )}
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
          
          <span className="text-sm font-semibold pr-2">{toast.message}</span>
          
          <button
            onClick={() => setToast(null)}
            className="rounded-lg p-0.5 hover:bg-slate-100/50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Upload and Configuration Form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Compare target Monthly Backlog with the dashboard list to extract missing records.
          </p>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* File Upload Area */}
          <div className="space-y-6">
            <UploadBox
              label="Monthly Backlog Excel"
              onChange={setMonthlyFile}
            />

            <UploadBox
              label={dashboardLabel}
              onChange={setDashboardFile}
            />
          </div>

          {/* Configuration Input Area */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
              {isParsing ? (
                <div className="space-y-6">
                  <div className="w-full">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Printing Done Date
                    </label>
                    <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-500" />
                      Scanning backlog dates...
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Prepared By
                    </label>
                    <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-500" />
                      Scanning backlog operators...
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Printing Done Date
                    </label>
                    {availableDates.length > 0 ? (
                      <select
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                      >
                        <option value="">Select a date...</option>
                        {availableDates.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    )}
                  </div>

                  <div className="w-full">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Prepared By
                    </label>
                    {availableOperators.length > 0 ? (
                      <select
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                      >
                        <option value="">Select operator...</option>
                        {availableOperators.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. SURAJ"
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value.toUpperCase())}
                        className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Run Button */}
            <button
              onClick={analyze}
              disabled={loading || isParsing}
              className={cn(
                "relative flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 h-12 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-blue-700 hover:shadow-lg disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none cursor-pointer",
                loading && "pl-8"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="absolute left-4 h-5 w-5 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5 fill-current" />
                  {buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {hasRun && (
        <div className="space-y-8 transition-all duration-500 animate-slide-up">
          <div className="border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">
              Analysis Results Summary
            </h2>
            <SummaryCards
              totalChecked={totalChecked}
              matched={matchedCount}
              missing={missingCount}
              preparedBy={preparedBy.trim().toUpperCase()}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Missing Case Records ({missingCount})
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                These UIDs exist in the filtered backlog but are not found in the Dashboard.
              </p>
            </div>
            
            <ResultTable
              cases={missingCases}
              reportData={reportData}
              reportFilename={reportFilename}
              analyzerTitle={title}
            />
          </div>
        </div>
      )}
    </div>
  );
}