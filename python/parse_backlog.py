import pandas as pd
import json
import sys
import os
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

try:
    if len(sys.argv) < 2:
        raise ValueError("Missing file argument. Usage: parse_backlog.py <monthly_file>")

    monthly_file = sys.argv[1]

    # Load monthly backlog using robust sheet reader
    xl_monthly = pd.ExcelFile(monthly_file)
    compiled_sheets = [s for s in xl_monthly.sheet_names if "compiled" in s.lower()]

    def read_excel_optimized_metadata(file_path, sheet_name):
        try:
            df_headers = pd.read_excel(file_path, sheet_name=sheet_name, nrows=0)
            columns = [str(c).strip() for c in df_headers.columns]
            target_cols = []
            for col in columns:
                col_lower = col.lower()
                if "printing done" in col_lower or "print done" in col_lower:
                    target_cols.append(col)
                elif "prepared by" in col_lower or "prep by" in col_lower or "preparedby" in col_lower:
                    target_cols.append(col)
            if target_cols:
                return pd.read_excel(file_path, sheet_name=sheet_name, usecols=target_cols)
        except Exception as e:
            print(f"Metadata read optimization error: {e}", file=sys.stderr)
        return pd.read_excel(file_path, sheet_name=sheet_name)

    if compiled_sheets:
        monthly_df = read_excel_optimized_metadata(monthly_file, compiled_sheets[0])
    else:
        dfs = []
        for sheet in xl_monthly.sheet_names:
            if sheet.lower() == "summary":
                continue
            try:
                # Fast check using headers only
                df_headers = pd.read_excel(monthly_file, sheet_name=sheet, nrows=0)
                df_cols_lower = [str(c).lower().strip() for c in df_headers.columns]
                # Check for key columns
                has_uid = any("uid" in c for c in df_cols_lower)
                has_date = any("printing done" in c or "print done" in c for c in df_cols_lower)
                if has_uid and has_date:
                    df = read_excel_optimized_metadata(monthly_file, sheet)
                    dfs.append(df)
            except Exception as e:
                print(f"Error reading sheet {sheet}: {e}", file=sys.stderr, flush=True)
        if dfs:
            monthly_df = pd.concat(dfs, ignore_index=True)
        else:
            monthly_df = read_excel_optimized_metadata(monthly_file, xl_monthly.sheet_names[0])

    # Harmonize columns
    monthly_df.columns = monthly_df.columns.astype(str).str.strip()

    date_col = None
    for col in monthly_df.columns:
        if "printing done" in str(col).lower() or "print done" in str(col).lower():
            date_col = col
            break

    prep_col = None
    for col in monthly_df.columns:
        if "prepared by" in str(col).lower() or "prep by" in str(col).lower() or "preparedby" in str(col).lower():
            prep_col = col
            break

    dates = []
    operators = []

    if date_col:
        # Extract unique dates, format to YYYY-MM-DD
        parsed_dates = pd.to_datetime(monthly_df[date_col], errors="coerce").dropna()
        formatted_dates = parsed_dates.dt.strftime("%Y-%m-%d").unique()
        dates = sorted(list(formatted_dates), reverse=True)

    if prep_col:
        # Extract unique operators, trimmed, uppercase, non-empty
        raw_ops = monthly_df[prep_col].fillna("").astype(str).str.strip().str.upper()
        unique_ops = raw_ops[raw_ops != ""].unique()
        operators = sorted(list(unique_ops))

    result = {
        "success": True,
        "dates": dates,
        "operators": operators
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e)
    }))
