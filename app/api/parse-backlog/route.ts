import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  let tempFilePath = "";
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
    tempFilePath = path.join(uploadDir, `backlog_metadata_${timestamp}.xlsx`);
    fs.writeFileSync(tempFilePath, Buffer.from(await file.arrayBuffer()));

    return await new Promise<Response>((resolve) => {
      const python = spawn("python", ["python/parse_backlog.py", tempFilePath]);

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
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupErr) {
          console.error("Cleanup Error in parse-backlog API:", cleanupErr);
        }

        if (code !== 0) {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: "Python failed to parse backlog metadata.",
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
                { success: false, message: result.error || "Failed to parse metadata" },
                { status: 400 }
              )
            );
          }
        } catch (e) {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: "Invalid response from python parsing script.",
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
    // Clean up file if error occurs before spawn closes
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupErr) {
      console.error("Emergency cleanup error in parse-backlog API:", cleanupErr);
    }

    console.error("Parse backlog metadata error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 },
    );
  }
}
