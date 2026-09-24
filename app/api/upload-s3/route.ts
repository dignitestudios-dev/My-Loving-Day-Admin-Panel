import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function PUT(req: NextRequest) {
  try {
    const uploadUrl = req.headers.get("x-upload-url");
    const contentType = req.headers.get("x-content-type") || "application/octet-stream";

    if (!uploadUrl) {
      return NextResponse.json(
        { success: false, message: "Missing x-upload-url header" },
        { status: 400 }
      );
    }

    const arrayBuffer = await req.arrayBuffer();

    const s3Response = await fetch(uploadUrl, {
      method: "PUT",
      body: arrayBuffer,
      headers: {
        "Content-Type": contentType,
      },
    });

    if (!s3Response.ok) {
      const errorText = await s3Response.text();
      return NextResponse.json(
        {
          success: false,
          message: `S3 upload failed with status ${s3Response.status}`,
          details: errorText,
        },
        { status: s3Response.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: s3Response.status,
      message: "File uploaded successfully to S3",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server upload error",
      },
      { status: 500 }
    );
  }
}
