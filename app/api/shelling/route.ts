import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  let monthlyPath = "";
  let dashboardPath = "";

  try {
    const formData = await req.formData();

    const monthly = formData.get("monthly") as File;
    const dashboard = formData.get("dashboard") as File;
    const date = formData.get("date") as string;
    const preparedBy = formData.get("preparedBy") as string;

    if (!monthly || !dashboard) {
      return NextResponse.json(
        {
          success: false,
          message: "Both Excel files are required.",
        },
        { status: 400 },
      );
    }

    if (!date || !preparedBy) {
      return NextResponse.json(
        {
          success: false,
          message: "Date and Prepared By are required.",
        },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    monthlyPath = path.join(uploadDir, `monthly_shelling_${timestamp}.xlsx`);
    dashboardPath = path.join(uploadDir, `dashboard_shelling_${timestamp}.xlsx`);

    fs.writeFileSync(monthlyPath, Buffer.from(await monthly.arrayBuffer()));
    fs.writeFileSync(dashboardPath, Buffer.from(await dashboard.arrayBuffer()));

    return await new Promise<Response>((resolve) => {
      const python = spawn("python", [
        "python/shelling.py",
        monthlyPath,
        dashboardPath,
        date,
        preparedBy,
      ]);

      let output = "";
      let error = "";

      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        error += data.toString();
      });

      python.on("close", (code) => {
        // Clean up temporary uploads
        try {
          if (monthlyPath && fs.existsSync(monthlyPath)) fs.unlinkSync(monthlyPath);
          if (dashboardPath && fs.existsSync(dashboardPath)) fs.unlinkSync(dashboardPath);
        } catch (cleanupErr) {
          console.error("Cleanup Error:", cleanupErr);
        }

        console.log("========== SHELLING PYTHON RESULT ==========");
        console.log("Exit Code:", code);
        console.log("Output:", output);
        console.log("Error:", error);
        console.log("===================================");

        if (code !== 0) {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: "Python Script Failed",
                output,
                error,
              },
              { status: 500 },
            ),
          );
          return;
        }

        try {
          const result = JSON.parse(output.trim());
          if (result.success) {
            resolve(NextResponse.json(result));
          } else {
            resolve(
              NextResponse.json(
                {
                  success: false,
                  message: result.error || "Analysis failed.",
                  output,
                  error,
                },
                { status: 400 },
              ),
            );
          }
        } catch (e) {
          console.error("JSON Parse Error:", e);

          resolve(
            NextResponse.json(
              {
                success: false,
                message: "Python returned invalid JSON.",
                output,
                error,
              },
              { status: 500 },
            ),
          );
        }
      });
    });
  } catch (err: any) {
    // Emergency cleanup
    try {
      if (monthlyPath && fs.existsSync(monthlyPath)) fs.unlinkSync(monthlyPath);
      if (dashboardPath && fs.existsSync(dashboardPath)) fs.unlinkSync(dashboardPath);
    } catch (cleanupErr) {
      console.error("Emergency Cleanup Error:", cleanupErr);
    }

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: err.message,
      },
      { status: 500 },
    );
  }
}
