import { NextResponse } from "next/server";
import { getMaintenanceRecords, addMaintenanceRecord } from "@/lib/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hospitalId = searchParams.get("hospitalId");

  if (!hospitalId) {
    return NextResponse.json(
      { error: "hospitalId is required" },
      { status: 400 },
    );
  }

  const records = await getMaintenanceRecords(hospitalId);

  const completed = records.filter((r) => r.status === "completed").length;
  const inProgress = records.filter((r) => r.status === "in_progress").length;
  const upcoming = records.filter((r) => r.status === "scheduled").length;

  return NextResponse.json({
    records,
    stats: [
      { label: "Total Records", value: String(records.length), type: "total" },
      { label: "Completed", value: String(completed), type: "completed" },
      { label: "In Progress", value: String(inProgress), type: "in_progress" },
      { label: "Upcoming", value: String(upcoming), type: "upcoming" },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.hospitalId || !body.equipmentId || !body.equipmentName) {
      return NextResponse.json(
        { error: "hospitalId, equipmentId and equipmentName are required" },
        { status: 400 },
      );
    }

    const id = await addMaintenanceRecord({
      equipmentId: body.equipmentId,
      equipmentName: body.equipmentName,
      type: body.type ?? "preventive",
      status: body.status ?? "scheduled",
      description: body.description ?? "",
      technicianId: body.technicianId ?? "",
      technicianName: body.technicianName ?? "Unassigned",
      scheduledDate:
        body.scheduledDate ? new Date(body.scheduledDate) : new Date(),
      completedDate: body.status === "completed" ? new Date() : null,
      downtime: Number(body.downtime) || 0,
      cost: Number(body.cost) || 0,
      partsReplaced: body.partsReplaced ?? [],
      notes: body.notes ?? "",
      hospitalId: body.hospitalId,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/maintenance error:", error);
    return NextResponse.json(
      { error: "Failed to save maintenance record" },
      { status: 500 },
    );
  }
}
