import * as XLSX from "xlsx";

export interface HarmonizedCase {
  uid: string;
  sofNo: string;
  patientName: string;
  preparedBy: string;
  printingDone: string;
  machine: string;
}

// Clean and normalize dates to YYYY-MM-DD
function normalizeDate(rawDate: any): string {
  if (!rawDate) return "";

  // If already a JS Date object
  if (rawDate instanceof Date) {
    if (isNaN(rawDate.getTime())) return "";
    const y = rawDate.getFullYear();
    const m = String(rawDate.getMonth() + 1).padStart(2, "0");
    const d = String(rawDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // If Excel numeric serial date code
  if (typeof rawDate === "number") {
    try {
      const dateObj = XLSX.SSF.parse_date_code(rawDate);
      const m = String(dateObj.m).padStart(2, "0");
      const d = String(dateObj.d).padStart(2, "0");
      return `${dateObj.y}-${m}-${d}`;
    } catch (e) {
      return "";
    }
  }

  // Parse as string
  try {
    const dateStr = String(rawDate).trim();
    // Try standard JS Date parsing
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  } catch (e) {}

  return "";
}

// Harmonize a row to target keys case-insensitively
function getHarmonizedRow(row: any): HarmonizedCase {
  const keys = Object.keys(row);
  const harmonized: HarmonizedCase = {
    uid: "",
    sofNo: "",
    patientName: "",
    preparedBy: "",
    printingDone: "",
    machine: row["Machine"] || "",
  };

  for (const key of keys) {
    const keyLower = key.toLowerCase().trim();
    const val = row[key];

    if (keyLower.includes("uid")) {
      harmonized.uid = String(val ?? "").trim().toUpperCase();
    } else if (keyLower.includes("printing done") || keyLower.includes("print done")) {
      harmonized.printingDone = normalizeDate(val);
    } else if (keyLower.includes("prepared by") || keyLower.includes("prep by") || keyLower.includes("preparedby")) {
      harmonized.preparedBy = String(val ?? "").trim().toUpperCase();
    } else if (keyLower.includes("patient") || keyLower.includes("customer") || keyLower.includes("name")) {
      harmonized.patientName = String(val ?? "").trim();
    } else if (keyLower.includes("sof")) {
      // SOF numbers can sometimes parse as numbers with float decimal points
      harmonized.sofNo = String(val ?? "")
        .replace(".0", "")
        .trim();
    } else if (keyLower.includes("machine") || keyLower.includes("mach")) {
      if (!harmonized.machine) {
        harmonized.machine = String(val ?? "").trim().toUpperCase();
      }
    }
  }

  return harmonized;
}

// Parse monthly backlog from buffer or array data
function getBacklogRows(backlogBuffer: any): HarmonizedCase[] {
  const workbook = XLSX.read(backlogBuffer, { type: "array" });
  const sheetNames = workbook.SheetNames;
  const compiledSheets = sheetNames.filter((s) => s.toLowerCase().includes("compiled"));

  let rawRows: any[] = [];

  if (compiledSheets.length > 0) {
    const sheet = workbook.Sheets[compiledSheets[0]];
    // Using raw: false/true to parse values properly
    rawRows = XLSX.utils.sheet_to_json<any>(sheet);
  } else {
    // Merge matching sheets
    for (const sheetName of sheetNames) {
      if (sheetName.toLowerCase() === "summary") continue;
      try {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);
        if (rows.length > 0) {
          const keysLower = Object.keys(rows[0]).map((k) => k.toLowerCase().trim());
          if (keysLower.includes("uid number") && keysLower.includes("printing done")) {
            rows.forEach((r) => {
              r["Machine"] = sheetName; // Add Machine name as the sheet name
            });
            rawRows.push(...rows);
          }
        }
      } catch (e) {
        console.error(`Error reading sheet ${sheetName}:`, e);
      }
    }
  }

  // Harmonize all parsed rows
  return rawRows
    .map((r) => getHarmonizedRow(r))
    .filter((r) => r.uid !== ""); // Remove empty UIDs
}

// Extract unique dates and operator names from backlog
export function parseBacklogMetadata(backlogBuffer: any) {
  const rows = getBacklogRows(backlogBuffer);

  const datesSet = new Set<string>();
  const operatorsSet = new Set<string>();

  for (const row of rows) {
    if (row.printingDone) {
      datesSet.add(row.printingDone);
    }
    if (row.preparedBy) {
      operatorsSet.add(row.preparedBy);
    }
  }

  return {
    success: true,
    dates: Array.from(datesSet).sort((a, b) => b.localeCompare(a)), // descending (latest first)
    operators: Array.from(operatorsSet).sort((a, b) => a.localeCompare(b)), // alphabetical
  };
}

// Get Set of UIDs from dashboard
function getDashboardUIDs(dashboardBuffer: any): Set<string> {
  const workbook = XLSX.read(dashboardBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  const uids = new Set<string>();
  for (const row of rows) {
    const keys = Object.keys(row);
    let uidVal = "";
    const uidKey = keys.find((k) => k.toLowerCase().includes("uid"));

    if (uidKey) {
      uidVal = String(row[uidKey] ?? "");
    } else if (keys.length > 0) {
      uidVal = String(row[keys[0]] ?? "");
    }

    uidVal = uidVal.trim().toUpperCase();
    if (uidVal) {
      uids.add(uidVal);
    }
  }

  return uids;
}

// Format date back to YYYY-MM-DD
function getFormattedStandardDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface AnalysisResult {
  success: boolean;
  selected_date: string;
  prepared_by: string;
  total_checked: number;
  matched: number;
  missing: number;
  missing_cases: any[];
  report_data?: string; // base64 string
  report_filename?: string;
  error?: string;
}

export function performAnalysis(
  backlogBuffer: any,
  dashboardBuffer: any,
  date: string,
  preparedBy: string,
  type: "printing" | "shelling"
): AnalysisResult {
  try {
    const standardSelectedDate = getFormattedStandardDate(date);
    const targetOperator = preparedBy.trim().toUpperCase();

    // 1. Parse files
    const backlogRows = getBacklogRows(backlogBuffer);
    const dashboardUIDs = getDashboardUIDs(dashboardBuffer);

    // 2. Drop duplicate UIDs in backlog (keep first)
    const uniqueBacklogRows: HarmonizedCase[] = [];
    const seenUIDs = new Set<string>();
    for (const r of backlogRows) {
      if (!seenUIDs.has(r.uid)) {
        seenUIDs.add(r.uid);
        uniqueBacklogRows.push(r);
      }
    }

    // 3. Filter backlog rows by date & operator
    const filteredRows = uniqueBacklogRows.filter(
      (r) => r.printingDone === standardSelectedDate && r.preparedBy === targetOperator
    );

    const totalChecked = filteredRows.length;

    // 4. Compare based on type
    let matchedRows: HarmonizedCase[] = [];
    let missingRows: HarmonizedCase[] = [];
    let statusText = "";

    if (type === "printing") {
      statusText = "Printing Missing";
      // Matched: completed, i.e. NOT present in printing dashboard queue anymore
      matchedRows = filteredRows.filter((r) => !dashboardUIDs.has(r.uid));
      // Missing: pending, i.e. still present in printing dashboard queue
      missingRows = filteredRows.filter((r) => dashboardUIDs.has(r.uid));
    } else {
      statusText = "Shelling Missing";
      // Matched: completed, i.e. NOT present in shelling dashboard queue anymore
      matchedRows = filteredRows.filter((r) => !dashboardUIDs.has(r.uid));
      // Missing: pending, i.e. still present in shelling dashboard queue
      missingRows = filteredRows.filter((r) => dashboardUIDs.has(r.uid));
    }

    // Sort missing rows by UID alphabetically
    missingRows.sort((a, b) => a.uid.localeCompare(b.uid));

    const missingCases = missingRows.map((r) => ({
      "UID number": r.uid,
      "SOF NO.": r.sofNo,
      "Patient Name": r.patientName,
      "Prepared By": r.preparedBy,
      "Printing Done": r.printingDone,
      "Machine": r.machine,
      "Status": statusText,
    }));

    // 5. Generate Excel Report in-memory (base64)
    let reportDataBase64 = "";
    let reportFilename = "";

    if (totalChecked > 0) {
      const exportRows = missingRows.map((r) => ({
        "UID Number": r.uid,
        "SOF No.": r.sofNo,
        "Patient Name": r.patientName,
        "Prepared By": r.preparedBy,
        "Printing Done": r.printingDone,
        "Machine": r.machine,
        "Status": statusText,
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Missing Cases");

      // Generate buffer in memory
      const wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "array" };
      const outBuffer = XLSX.write(wb, wopts);
      
      // Node.js vs Browser base64 conversion
      if (typeof Buffer !== "undefined") {
        reportDataBase64 = Buffer.from(outBuffer).toString("base64");
      } else {
        let binary = "";
        const bytes = new Uint8Array(outBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        reportDataBase64 = window.btoa(binary);
      }

      const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
      reportFilename = `${type}_missing_${targetOperator}_${standardSelectedDate}_${timestamp}.xlsx`;
    }

    return {
      success: true,
      selected_date: standardSelectedDate,
      prepared_by: targetOperator,
      total_checked: totalChecked,
      matched: matchedRows.length,
      missing: missingRows.length,
      missing_cases: missingCases,
      report_data: reportDataBase64,
      report_filename: reportFilename,
    };
  } catch (e: any) {
    return {
      success: false,
      selected_date: "",
      prepared_by: "",
      total_checked: 0,
      matched: 0,
      missing: 0,
      missing_cases: [],
      error: e.message || String(e),
    };
  }
}
