// app/api/records/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------- CREATE ----------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userName, caseDocument, sessionStage } = body;

    if (!userName || !caseDocument)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const saved = await prisma.courtRecord.create({
      data: { userName, caseDocument, sessionStage },
    });
    return NextResponse.json({ message: "Created", data: saved }, { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------- READ ----------
export async function GET() {
  try {
    const all = await prisma.courtRecord.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(all, { status: 200 });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------- UPDATE ----------
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, caseDocument, sessionStage } = body;

    if (!id)
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });

    const updated = await prisma.courtRecord.update({
      where: { id },
      data: { caseDocument, sessionStage },
    });
    return NextResponse.json({ message: "Updated", data: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------- DELETE ----------
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id)
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });

    await prisma.courtRecord.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
