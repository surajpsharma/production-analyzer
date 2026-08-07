import pandas as pd
import json
import sys
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

try:
    if len(sys.argv) < 2:
        raise ValueError("Missing file argument. Usage: get_machines.py <monthly_file>")

    file_path = sys.argv[1]
    xl = pd.ExcelFile(file_path)
    machines = set()

    compiled_sheets = [s for s in xl.sheet_names if "compiled" in s.lower()]
    
    if compiled_sheets:
        df = pd.read_excel(file_path, sheet_name=compiled_sheets[0])
        # Find machine column (case-insensitive substring match)
        mach_col = None
        for col in df.columns:
            if "machine" in str(col).lower() or "mach" in str(col).lower():
                mach_col = col
                break
        if mach_col:
            unique_machs = df[mach_col].dropna().astype(str).str.strip().unique()
            for m in unique_machs:
                val = m.strip().upper()
                if val:
                    machines.add(val)

    # If no machines found in compiled sheet, check standard printer sheets
    if not machines:
        for sheet in xl.sheet_names:
            if sheet.lower() in ["summary", "compiled sheet"] or "compiled" in sheet.lower():
                continue
            machines.add(sheet.strip().upper())

    # Return sorted list
    result = {
        "success": True,
        "machines": sorted(list(machines))
    }
    print(json.dumps(result))

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e)
    }))
