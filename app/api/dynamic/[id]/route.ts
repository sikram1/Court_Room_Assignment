import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // Await the params object
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const record = await prisma.courtRecord.findUnique({
      where: { id: numericId },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return new NextResponse(record.caseDocument, {
      headers: { "content-type": "text/html" },
    });
  } catch (error) {
    console.error("Dynamic route error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
