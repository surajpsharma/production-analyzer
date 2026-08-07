import Header from "@/components/common/Header";
import PageContainer from "@/components/common/PageContainer";
import AnalyzerCard from "@/components/analyzer/AnalyzerCard";
import { Sparkles, FileSpreadsheet, Calendar, User, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />

      <PageContainer>
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-2xl mx-auto animate-fade-in mt-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/10 mb-6">
            <Sparkles className="h-4 w-4 fill-current animate-pulse" />
            <span>Toothsi Production Tools</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Production Analyzer
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed">
            Quickly identify Shelling Missing and Printing Missing aligner cases. Filter monthly backlogs, match with active dashboards, and export clean reports in seconds.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <AnalyzerCard
            title="Shelling Missing"
            description="Extract cases that are printed but missing from the Shelling Dashboard to resolve production blockages."
            href="/shelling"
            icon="shelling"
          />

          <AnalyzerCard
            title="Printing Missing"
            description="Match monthly backlogs against the Printing Dashboard to identify cases missing from the print queue."
            href="/printing"
            icon="printing"
          />
        </div>

        {/* Workflow Overview Section */}
        <div className="mt-20 max-w-4xl mx-auto border border-slate-100 bg-white rounded-3xl p-8 sm:p-10 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            Analyzer Workflow
          </h3>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  01
                </div>
                <h4 className="text-sm font-bold text-slate-800">Upload Files</h4>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Provide the Monthly Backlog and matching Dashboard Excel files.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  02
                </div>
                <h4 className="text-sm font-bold text-slate-800">Define Scope</h4>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Input the specific Printing Done date and Prepared By name to filter cases.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  03
                </div>
                <h4 className="text-sm font-bold text-slate-800">Compare UIDs</h4>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Our Python script executes, comparing the filtered case UIDs against the dashboard records.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  04
                </div>
                <h4 className="text-sm font-bold text-slate-800">Export Results</h4>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Review matched vs missing statistics, filter table rows, and export clean Excel files.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}