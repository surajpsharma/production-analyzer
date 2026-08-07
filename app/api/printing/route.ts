import { NextRequest, NextResponse } from "next/server";
import { performAnalysis } from "@/lib/excelProcessor";

export async function POST(req: NextRequest) {
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

    const monthlyBuffer = Buffer.from(await monthly.arrayBuffer());
    const dashboardBuffer = Buffer.from(await dashboard.arrayBuffer());

    const result = performAnalysis(
      monthlyBuffer,
      dashboardBuffer,
      date,
      preparedBy,
      "printing"
    );

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Analysis failed.",
        },
        { status: 400 },
      );
    }
  } catch (err: any) {
    console.error("Printing analysis error:", err);
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
