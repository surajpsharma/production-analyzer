import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

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

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const tempFilePath = path.join(uploadDir, `backlog_parse_${timestamp}.xlsx`);
    fs.writeFileSync(tempFilePath, Buffer.from(await file.arrayBuffer()));

    return await new Promise<Response>((resolve) => {
      const python = spawn("python", ["python/get_machines.py", tempFilePath]);

      let output = "";
      let error = "";

      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        error += data.toString();
      });

      python.on("close", (code) => {
        // Clean up temp file
        try {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        } catch (cleanupErr) {
          console.error("Cleanup Error in machines API:", cleanupErr);
        }

        if (code !== 0) {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: "Python failed to read machines list.",
                error,
              },
              { status: 500 },
            ),
          );
          return;
        }

        try {
          const result = JSON.parse(output.trim());
          resolve(NextResponse.json(result));
        } catch (e) {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: "Invalid response from python script.",
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
    console.error("Parse machines error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }
}
