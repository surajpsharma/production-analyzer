import { NextRequest, NextResponse } from "next/server";
import { parseBacklogMetadata } from "@/lib/excelProcessor";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = parseBacklogMetadata(buffer);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Parse backlog metadata error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }
}
