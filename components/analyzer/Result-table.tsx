import * as React from "react";
import { useState, useMemo } from "react";
import { Search, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";

interface MissingCase {
  "UID number": string;
  "SOF NO.": string;
  "Patient Name": string;
  "Prepared By": string;
  "Printing Done": string;
  "Machine": string;
  "Status": string;
}

interface ResultTableProps {
  cases: MissingCase[];
  reportData?: string;
  reportFilename?: string;
  analyzerTitle: string;
}

export default function ResultTable({
  cases,
  reportData,
  reportFilename,
  analyzerTitle,
}: ResultTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Client-side search filtering
  const filteredCases = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return cases;

    return cases.filter((item) => {
      return (
        item["UID number"].toLowerCase().includes(query) ||
        item["SOF NO."].toLowerCase().includes(query) ||
        item["Patient Name"].toLowerCase().includes(query) ||
        item["Prepared By"].toLowerCase().includes(query) ||
        item["Machine"].toLowerCase().includes(query) ||
        item["Status"].toLowerCase().includes(query)
      );
    });
  }, [cases, search]);

  // Reset pagination on search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination calculations
  const totalRows = filteredCases.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredCases.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCases, currentPage, rowsPerPage]);

  // Client-side CSV/Excel exporter (of currently filtered view)
  const handleExportCSV = () => {
    const headers = ["UID Number", "SOF No.", "Patient Name", "Prepared By", "Printing Done", "Machine", "Status"];
    const rows = filteredCases.map((c) => [
      c["UID number"],
      c["SOF NO."],
      c["Patient Name"],
      c["Prepared By"],
      c["Printing Done"],
      c["Machine"],
      c["Status"],
    ]);

    // Handle UTF-8 BOM for Excel compatibility
    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute(
      "download",
      `filtered_${analyzerTitle.toLowerCase().replace(/\s+/g, "_")}_${timestamp}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download the server-generated full Excel report from in-memory Base64 data
  const handleDownloadServerReport = () => {
    if (!reportData) return;

    try {
      // Decode Base64 string to binary array
      const byteCharacters = atob(reportData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = reportFilename || `${analyzerTitle.toLowerCase().replace(/\s+/g, "_")}_report.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download Excel report:", e);
      alert("Failed to download Excel report. Please export the filtered view instead.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by UID, SOF, or Patient Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2 h-11 px-4 cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
            Export Filtered
          </Button>

          {reportData && (
            <Button
              variant="default"
              onClick={handleDownloadServerReport}
              className="flex items-center gap-2 h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              Download Full Excel
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">UID Number</TableHead>
                <TableHead className="w-[120px]">SOF No.</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead className="w-[120px]">Prepared By</TableHead>
                <TableHead className="w-[120px]">Printing Done</TableHead>
                <TableHead className="w-[120px]">Machine</TableHead>
                <TableHead className="w-[140px] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCases.length > 0 ? (
                paginatedCases.map((item, index) => (
                  <TableRow key={index} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono font-semibold text-slate-900">
                       {item["UID number"]}
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">
                      {item["SOF NO."]}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {item["Patient Name"]}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item["Prepared By"]}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item["Printing Done"]}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {item["Machine"]}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/10">
                        {item["Status"]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-500">
                    No missing cases found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
            <span className="ml-4 border-l border-slate-200 pl-4">
              Showing {totalRows > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-slate-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
