import pandas as pd
import json
import sys
import os
import warnings
from datetime import datetime

warnings.filterwarnings("ignore", category=UserWarning)

try:
    if len(sys.argv) < 5:
        raise ValueError("Missing required arguments. Usage: shelling.py <monthly_file> <dashboard_file> <selected_date> <prepared_by>")

    monthly_file = sys.argv[1]
    dashboard_file = sys.argv[2]
    selected_date = sys.argv[3]
    prepared_by = sys.argv[4].strip().upper()

    # -----------------------------
    # Read Excel Files
    # -----------------------------
    def read_excel_optimized(file_path, sheet_name):
        try:
            df_headers = pd.read_excel(file_path, sheet_name=sheet_name, nrows=0)
            columns = [str(c).strip() for c in df_headers.columns]
            target_cols = []
            for col in columns:
                col_lower = col.lower()
                if "uid" in col_lower:
                    target_cols.append(col)
                elif "printing done" in col_lower or "print done" in col_lower:
                    target_cols.append(col)
                elif "prepared by" in col_lower or "prep by" in col_lower or "preparedby" in col_lower:
                    target_cols.append(col)
                elif "patient" in col_lower or "customer" in col_lower or "name" in col_lower:
                    target_cols.append(col)
                elif "sof" in col_lower:
                    target_cols.append(col)
                elif "machine" in col_lower or "mach" in col_lower:
                    target_cols.append(col)
            if target_cols:
                return pd.read_excel(file_path, sheet_name=sheet_name, usecols=target_cols)
        except Exception as e:
            print(f"Optimization error on {sheet_name}: {e}", file=sys.stderr)
        return pd.read_excel(file_path, sheet_name=sheet_name)

    # Load monthly backlog using robust sheet reader
    xl_monthly = pd.ExcelFile(monthly_file)
    compiled_sheets = [s for s in xl_monthly.sheet_names if "compiled" in s.lower()]
    
    if compiled_sheets:
        print(f"Reading compiled sheet: {compiled_sheets[0]}", file=sys.stderr)
        monthly_df = read_excel_optimized(monthly_file, compiled_sheets[0])
    else:
        dfs = []
        for sheet in xl_monthly.sheet_names:
            if sheet.lower() == "summary":
                continue
            try:
                # Fast check using headers only
                df_headers = pd.read_excel(monthly_file, sheet_name=sheet, nrows=0)
                df_cols_lower = [str(c).lower().strip() for c in df_headers.columns]
                if "uid number" in df_cols_lower and "printing done" in df_cols_lower:
                    print(f"Reading and merging sheet: {sheet}", file=sys.stderr)
                    df = read_excel_optimized(monthly_file, sheet)
                    df["Machine"] = sheet
                    dfs.append(df)
            except Exception as e:
                print(f"Error reading sheet {sheet}: {e}", file=sys.stderr, flush=True)
        if dfs:
            monthly_df = pd.concat(dfs, ignore_index=True)
        else:
            monthly_df = read_excel_optimized(monthly_file, xl_monthly.sheet_names[0])

    dashboard_df = pd.read_excel(dashboard_file)

    # -----------------------------
    # Clean Column Names
    # -----------------------------
    monthly_df.columns = monthly_df.columns.astype(str).str.strip()
    dashboard_df.columns = dashboard_df.columns.astype(str).str.strip()

    # Harmonize monthly backlog columns
    uid_col = None
    for col in monthly_df.columns:
        if "uid" in str(col).lower():
            uid_col = col
            break
    if uid_col:
        monthly_df.rename(columns={uid_col: "UID number"}, inplace=True)
    else:
        raise ValueError(f"Required UID column not found in Monthly Backlog. Available columns: {list(monthly_df.columns)}")

    date_col = None
    for col in monthly_df.columns:
        if "printing done" in str(col).lower() or "print done" in str(col).lower():
            date_col = col
            break
    if date_col:
        monthly_df.rename(columns={date_col: "Printing Done"}, inplace=True)
    else:
        raise ValueError(f"Required 'Printing Done' column not found in Monthly Backlog. Available columns: {list(monthly_df.columns)}")

    prep_col = None
    for col in monthly_df.columns:
        if "prepared by" in str(col).lower() or "prep by" in str(col).lower() or "preparedby" in str(col).lower():
            prep_col = col
            break
    if prep_col:
        monthly_df.rename(columns={prep_col: "Prepared By"}, inplace=True)
    else:
        raise ValueError(f"Required 'Prepared By' column not found in Monthly Backlog. Available columns: {list(monthly_df.columns)}")

    pat_col = None
    for col in monthly_df.columns:
        if "patient" in str(col).lower() or "customer" in str(col).lower() or "name" in str(col).lower():
            pat_col = col
            break
    if pat_col:
        monthly_df.rename(columns={pat_col: "Patient Name"}, inplace=True)
    else:
        monthly_df["Patient Name"] = ""

    sof_col = None
    for col in monthly_df.columns:
        if "sof" in str(col).lower():
            sof_col = col
            break
    if sof_col:
        monthly_df.rename(columns={sof_col: "SOF NO."}, inplace=True)
    else:
        monthly_df["SOF NO."] = ""

    # Machine column mapping (if not already "Machine")
    # Note: If Compiled sheet is not used, "Machine" is already set to the sheet name.
    # We only overwrite if a machine-like column is actually found in the sheet.
    mach_col = None
    for col in monthly_df.columns:
        if "machine" in str(col).lower() or "mach" in str(col).lower():
            if str(col).lower() != "machine":
                mach_col = col
            break
    if mach_col:
        monthly_df.rename(columns={mach_col: "Machine"}, inplace=True)
    elif "Machine" not in monthly_df.columns:
        monthly_df["Machine"] = ""

    # Harmonize dashboard columns
    uid_dash_col = None
    for col in dashboard_df.columns:
        if "uid" in str(col).lower():
            uid_dash_col = col
            break
    if uid_dash_col:
        dashboard_df.rename(columns={uid_dash_col: "uid"}, inplace=True)
    else:
        dashboard_df.rename(columns={dashboard_df.columns[0]: "uid"}, inplace=True)

    # -----------------------------
    # Clean and Normalize Data
    # -----------------------------
    monthly_df["UID number"] = monthly_df["UID number"].fillna("").astype(str).str.strip().str.upper()
    dashboard_df["uid"] = dashboard_df["uid"].fillna("").astype(str).str.strip().str.upper()

    monthly_df["SOF NO."] = (
        monthly_df["SOF NO."]
        .fillna("")
        .astype(str)
        .str.replace(".0", "", regex=False)
        .str.strip()
    )

    monthly_df["Patient Name"] = monthly_df["Patient Name"].fillna("").astype(str).str.strip()
    monthly_df["Prepared By"] = monthly_df["Prepared By"].fillna("").astype(str).str.strip().str.upper()
    monthly_df["Machine"] = monthly_df["Machine"].fillna("").astype(str).str.strip().str.upper()

    # Parse and normalize dates to YYYY-MM-DD
    monthly_df["Printing Done"] = pd.to_datetime(
        monthly_df["Printing Done"],
        errors="coerce"
    ).dt.strftime("%Y-%m-%d")

    standard_selected_date = pd.to_datetime(
        selected_date,
        errors="coerce"
    ).strftime("%Y-%m-%d")

    # Remove empty/invalid UIDs
    monthly_df = monthly_df[monthly_df["UID number"] != ""]
    dashboard_df = dashboard_df[dashboard_df["uid"] != ""]

    # Drop duplicate UIDs
    monthly_df = monthly_df.drop_duplicates(subset=["UID number"])
    dashboard_df = dashboard_df.drop_duplicates(subset=["uid"])

    dashboard_uid = set(dashboard_df["uid"])

    # -----------------------------
    # Filter Monthly Backlog
    # -----------------------------
    filtered_df = monthly_df[
        (monthly_df["Printing Done"] == standard_selected_date)
        & (monthly_df["Prepared By"] == prepared_by)
    ]

    total_checked = len(filtered_df)

    # -----------------------------
    # Find Matched & Missing (Corrected Shelling Logic)
    # -----------------------------
    # Matched: completed, i.e. successfully present in Shelling Dashboard queue
    matched_df = filtered_df[filtered_df["UID number"].isin(dashboard_uid)]
    matched_count = len(matched_df)

    # Missing: pending, i.e. NOT present in Shelling Dashboard queue (never sent to shelling)
    missing_df = filtered_df[~filtered_df["UID number"].isin(dashboard_uid)]
    missing_count = len(missing_df)

    # Sort missing cases for output
    missing_df = missing_df.sort_values("UID number")

    missing_cases = []
    for _, row in missing_df.iterrows():
        missing_cases.append({
            "UID number": row["UID number"],
            "SOF NO.": row["SOF NO."],
            "Patient Name": row["Patient Name"],
            "Prepared By": row["Prepared By"],
            "Printing Done": row["Printing Done"],
            "Machine": row["Machine"],
            "Status": "Shelling Missing"
        })

    # -----------------------------
    # Generate Excel Report
    # -----------------------------
    report_filename = ""
    if total_checked > 0:
        reports_dir = os.path.join(os.getcwd(), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_filename = f"shelling_missing_{prepared_by}_{standard_selected_date}_{timestamp}.xlsx"
        report_path = os.path.join(reports_dir, report_filename)

        # Prepare export columns
        report_export_df = missing_df[["UID number", "SOF NO.", "Patient Name", "Prepared By", "Printing Done", "Machine"]].copy()
        report_export_df["Status"] = "Shelling Missing"
        report_export_df.columns = ["UID Number", "SOF No.", "Patient Name", "Prepared By", "Printing Done", "Machine", "Status"]

        report_export_df.to_excel(report_path, index=False)

    result = {
        "success": True,
        "selected_date": standard_selected_date,
        "prepared_by": prepared_by,
        "total_checked": total_checked,
        "matched": matched_count,
        "missing": missing_count,
        "missing_cases": missing_cases,
        "report_file": report_filename
    }

    print(json.dumps(result, ensure_ascii=False))

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e)
    }))