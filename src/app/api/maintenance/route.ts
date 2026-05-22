// app/api/maintenance/route.ts
import { NextResponse } from "next/server";

// 1. Explicitly define what a Maintenance Record looks like
interface MaintenanceRecord {
  id: string;
  equipment: string;
  dept: string;
  type: string;
  status: string;
  date: string;
  tech: string;
  duration: number | null; // Explicitly allows both types across all objects
  cost: number | null; // Explicitly allows both types across all objects
  findings: string | null;
}

// 2. Strongly type the dynamic data store array
let maintenanceStore: MaintenanceRecord[] = [
  {
    id: "m001",
    equipment: "Siemens ACUSON X700 Ultrasound",
    dept: "Radiology",
    type: "corrective",
    status: "completed",
    date: "2025-05-10",
    tech: "Emeka Okonkwo",
    duration: 6.5,
    cost: 280000,
    findings: "Transducer probe replaced, software recalibrated",
  },
  {
    id: "m002",
    equipment: "GE Carescape B650 Monitor",
    dept: "ICU",
    type: "preventive",
    status: "in_progress",
    date: "2025-05-20",
    tech: "Fatima Bello",
    duration: null,
    cost: 45000,
    findings: "Routine PM ongoing",
  },
  {
    id: "m003",
    equipment: "Drager Babylog VN500",
    dept: "NICU",
    type: "emergency",
    status: "completed",
    date: "2025-05-15",
    tech: "Chukwudi Eze",
    duration: 3.0,
    cost: 620000,
    findings: "Flow sensor replaced, alarm system tested",
  },
  {
    id: "m004",
    equipment: "Philips IntelliVue MX550",
    dept: "Surgery",
    type: "calibration",
    status: "scheduled",
    date: "2025-05-26",
    tech: "Aisha Musa",
    duration: null,
    cost: null,
    findings: null,
  },
  {
    id: "m005",
    equipment: "Roche Cobas 6000 Analyzer",
    dept: "Laboratory",
    type: "preventive",
    status: "completed",
    date: "2025-05-08",
    tech: "Emeka Okonkwo",
    duration: 4.0,
    cost: 95000,
    findings: "Pipette serviced, reagent lines cleaned",
  },
  {
    id: "m006",
    equipment: "Mindray BS-480 Auto Analyzer",
    dept: "Laboratory",
    type: "corrective",
    status: "in_progress",
    date: "2025-05-21",
    tech: "Chukwudi Eze",
    duration: null,
    cost: null,
    findings: "Motor assembly failure — parts on order",
  },
  {
    id: "m007",
    equipment: "GE Voluson E10 Ultrasound",
    dept: "Obstetrics",
    type: "preventive",
    status: "scheduled",
    date: "2025-05-24",
    tech: "Fatima Bello",
    duration: null,
    cost: null,
    findings: null,
  },
];

export async function GET() {
  const totalRecords = maintenanceStore.length;
  const completed = maintenanceStore.filter(
    (r) => r.status === "completed",
  ).length;
  const inProgress = maintenanceStore.filter(
    (r) => r.status === "in_progress",
  ).length;

  // Calculate upcoming logs scheduled
  const upcoming = maintenanceStore.filter(
    (r) => r.status === "scheduled",
  ).length;

  return NextResponse.json({
    records: maintenanceStore,
    stats: [
      { label: "Total Records", value: String(totalRecords), type: "total" },
      { label: "Completed", value: String(completed), type: "completed" },
      { label: "In Progress", value: String(inProgress), type: "in_progress" },
      { label: "Upcoming", value: String(upcoming), type: "upcoming" },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic field mapping and validation
    const newRecord: MaintenanceRecord = {
      id: `m${String(maintenanceStore.length + 1).padStart(3, "0")}`,
      equipment: body.equipment || "Unknown Device",
      dept: body.dept || "General",
      type: body.type || "preventive",
      status: "scheduled", // Default initial state status for form additions
      date: body.date || new Date().toISOString().split("T")[0],
      tech: body.tech || "Unassigned",
      duration: body.duration ? Number(body.duration) : null,
      cost: body.cost ? Number(body.cost) : null,
      findings: body.findings || null,
    };

    maintenanceStore = [newRecord, ...maintenanceStore];
    return NextResponse.json(
      { success: true, data: newRecord },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to parse incoming payload data structure" },
      { status: 400 },
    );
  }
}
