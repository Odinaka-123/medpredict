import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Equipment,
  MaintenanceRecord,
  DashboardStats,
  EquipmentStatus,
  RiskLevel,
  EquipmentCategory,
  MaintenanceType,
  MaintenanceStatus,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val as string);
}

function equipmentFromDoc(
  id: string,
  data: Record<string, unknown>,
): Equipment {
  return {
    id,
    name: data.name as string,
    category: data.category as EquipmentCategory,
    manufacturer: data.manufacturer as string,
    model: data.model as string,
    serialNumber: data.serialNumber as string,
    location: data.location as string,
    department: data.department as string,
    status: data.status as EquipmentStatus,
    installDate: toDate(data.installDate),
    lastMaintenanceDate:
      data.lastMaintenanceDate ? toDate(data.lastMaintenanceDate) : null,
    nextMaintenanceDate:
      data.nextMaintenanceDate ? toDate(data.nextMaintenanceDate) : null,
    usageHours: (data.usageHours as number) ?? 0,
    failureCount: (data.failureCount as number) ?? 0,
    riskLevel: data.riskLevel as RiskLevel,
    hospitalId: data.hospitalId as string,
    notes: (data.notes as string) ?? "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function maintenanceFromDoc(
  id: string,
  data: Record<string, unknown>,
): MaintenanceRecord {
  return {
    id,
    equipmentId: data.equipmentId as string,
    equipmentName: data.equipmentName as string,
    type: data.type as MaintenanceType,
    status: data.status as MaintenanceStatus,
    description: data.description as string,
    technicianId: data.technicianId as string,
    technicianName: data.technicianName as string,
    scheduledDate: toDate(data.scheduledDate),
    completedDate: data.completedDate ? toDate(data.completedDate) : null,
    downtime: (data.downtime as number) ?? 0,
    cost: (data.cost as number) ?? 0,
    partsReplaced: (data.partsReplaced as string[]) ?? [],
    notes: (data.notes as string) ?? "",
    hospitalId: data.hospitalId as string,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export async function getEquipment(hospitalId: string): Promise<Equipment[]> {
  const q = query(
    collection(db, "equipment"),
    where("hospitalId", "==", hospitalId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    equipmentFromDoc(d.id, d.data() as Record<string, unknown>),
  );
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const snap = await getDoc(doc(db, "equipment", id));
  if (!snap.exists()) return null;
  return equipmentFromDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function addEquipment(
  data: Omit<Equipment, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, "equipment"), {
    ...data,
    installDate: Timestamp.fromDate(data.installDate),
    lastMaintenanceDate:
      data.lastMaintenanceDate ?
        Timestamp.fromDate(data.lastMaintenanceDate)
      : null,
    nextMaintenanceDate:
      data.nextMaintenanceDate ?
        Timestamp.fromDate(data.nextMaintenanceDate)
      : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEquipment(
  id: string,
  data: Partial<Omit<Equipment, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, "equipment", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEquipment(id: string): Promise<void> {
  await deleteDoc(doc(db, "equipment", id));
}

export async function getHighRiskEquipment(
  hospitalId: string,
  count = 5,
): Promise<Equipment[]> {
  const q = query(
    collection(db, "equipment"),
    where("hospitalId", "==", hospitalId),
    where("riskLevel", "in", ["high", "critical"]),
    orderBy("failureCount", "desc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    equipmentFromDoc(d.id, d.data() as Record<string, unknown>),
  );
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

export async function getMaintenanceRecords(
  hospitalId: string,
): Promise<MaintenanceRecord[]> {
  const q = query(
    collection(db, "maintenance"),
    where("hospitalId", "==", hospitalId),
    orderBy("scheduledDate", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    maintenanceFromDoc(d.id, d.data() as Record<string, unknown>),
  );
}

export async function getUpcomingMaintenance(
  hospitalId: string,
  count = 5,
): Promise<MaintenanceRecord[]> {
  const now = Timestamp.fromDate(new Date());
  const q = query(
    collection(db, "maintenance"),
    where("hospitalId", "==", hospitalId),
    where("status", "==", "scheduled"),
    where("scheduledDate", ">=", now),
    orderBy("scheduledDate", "asc"),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    maintenanceFromDoc(d.id, d.data() as Record<string, unknown>),
  );
}

export async function addMaintenanceRecord(
  data: Omit<MaintenanceRecord, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, "maintenance"), {
    ...data,
    scheduledDate: Timestamp.fromDate(data.scheduledDate),
    completedDate:
      data.completedDate ? Timestamp.fromDate(data.completedDate) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMaintenanceRecord(
  id: string,
  data: Partial<Omit<MaintenanceRecord, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, "maintenance", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, "maintenance", id));
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(
  hospitalId: string,
): Promise<DashboardStats> {
  const [equipmentSnap, maintenanceSnap] = await Promise.all([
    getDocs(
      query(collection(db, "equipment"), where("hospitalId", "==", hospitalId)),
    ),
    getDocs(
      query(
        collection(db, "maintenance"),
        where("hospitalId", "==", hospitalId),
      ),
    ),
  ]);

  const equipment = equipmentSnap.docs.map((d) =>
    equipmentFromDoc(d.id, d.data() as Record<string, unknown>),
  );
  const maintenance = maintenanceSnap.docs.map((d) =>
    maintenanceFromDoc(d.id, d.data() as Record<string, unknown>),
  );

  const now = new Date();
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const completed = maintenance.filter((m) => m.status === "completed");
  const avgDowntime =
    completed.length > 0 ?
      completed.reduce((a, m) => a + m.downtime, 0) / completed.length
    : 0;

  const totalCost = maintenance.reduce((a, m) => a + m.cost, 0);

  const maintenanceDueThisWeek = maintenance.filter(
    (m) =>
      m.status === "scheduled" &&
      m.scheduledDate >= now &&
      m.scheduledDate <= week,
  ).length;

  return {
    totalEquipment: equipment.length,
    operational: equipment.filter((e) => e.status === "operational").length,
    underMaintenance: equipment.filter((e) => e.status === "maintenance")
      .length,
    failed: equipment.filter((e) => e.status === "failed").length,
    criticalRisk: equipment.filter((e) => e.riskLevel === "critical").length,
    maintenanceDueThisWeek,
    avgDowntime: Math.round(avgDowntime * 10) / 10,
    totalMaintenanceCost: totalCost,
  };
}

// ─── Monthly chart data ───────────────────────────────────────────────────────

export async function getMonthlyMaintenanceData(
  hospitalId: string,
): Promise<
  { month: string; failures: number; preventive: number; corrective: number }[]
> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const q = query(
    collection(db, "maintenance"),
    where("hospitalId", "==", hospitalId),
    where("scheduledDate", ">=", Timestamp.fromDate(sixMonthsAgo)),
    orderBy("scheduledDate", "asc"),
  );
  const snap = await getDocs(q);
  const records = snap.docs.map((d) =>
    maintenanceFromDoc(d.id, d.data() as Record<string, unknown>),
  );

  const months: Record<
    string,
    { failures: number; preventive: number; corrective: number }
  > = {};
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  records.forEach((r) => {
    const key = monthNames[r.scheduledDate.getMonth()];
    if (!months[key])
      months[key] = { failures: 0, preventive: 0, corrective: 0 };
    if (r.type === "emergency") months[key].failures++;
    else if (r.type === "preventive" || r.type === "inspection")
      months[key].preventive++;
    else if (r.type === "corrective") months[key].corrective++;
  });

  return Object.entries(months).map(([month, data]) => ({ month, ...data }));
}

// ─── Seed demo data ───────────────────────────────────────────────────────────

export async function seedDemoData(
  hospitalId: string,
  userId: string,
): Promise<void> {
  const batch = writeBatch(db);

  const demoEquipment = [
    {
      name: "Siemens ACUSON X700 Ultrasound",
      category: "imaging",
      manufacturer: "Siemens",
      model: "ACUSON X700",
      serialNumber: "SN-001",
      department: "Radiology",
      location: "Room 101",
      status: "operational",
      riskLevel: "critical",
      usageHours: 4200,
      failureCount: 5,
    },
    {
      name: "GE Carescape B650 Monitor",
      category: "monitoring",
      manufacturer: "GE",
      model: "B650",
      serialNumber: "SN-002",
      department: "ICU",
      location: "ICU-04",
      status: "operational",
      riskLevel: "high",
      usageHours: 3800,
      failureCount: 3,
    },
    {
      name: "Philips IntelliVue MX550",
      category: "monitoring",
      manufacturer: "Philips",
      model: "MX550",
      serialNumber: "SN-003",
      department: "Surgery",
      location: "Theatre 2",
      status: "maintenance",
      riskLevel: "high",
      usageHours: 5100,
      failureCount: 4,
    },
    {
      name: "Drager Primus Anaesthesia",
      category: "life_support",
      manufacturer: "Drager",
      model: "Primus",
      serialNumber: "SN-004",
      department: "Theatre",
      location: "Theatre 1",
      status: "operational",
      riskLevel: "medium",
      usageHours: 2900,
      failureCount: 2,
    },
    {
      name: "GE Voluson E10 Ultrasound",
      category: "imaging",
      manufacturer: "GE",
      model: "Voluson E10",
      serialNumber: "SN-005",
      department: "Obstetrics",
      location: "Room 205",
      status: "operational",
      riskLevel: "low",
      usageHours: 1800,
      failureCount: 1,
    },
    {
      name: "Mindray DC-70 Ultrasound",
      category: "imaging",
      manufacturer: "Mindray",
      model: "DC-70",
      serialNumber: "SN-006",
      department: "Cardiology",
      location: "Room 303",
      status: "operational",
      riskLevel: "low",
      usageHours: 2200,
      failureCount: 0,
    },
    {
      name: "Philips Efficia CM10",
      category: "monitoring",
      manufacturer: "Philips",
      model: "CM10",
      serialNumber: "SN-007",
      department: "ICU",
      location: "ICU-02",
      status: "operational",
      riskLevel: "medium",
      usageHours: 3100,
      failureCount: 2,
    },
    {
      name: "Drager Babylog VN500",
      category: "life_support",
      manufacturer: "Drager",
      model: "VN500",
      serialNumber: "SN-008",
      department: "NICU",
      location: "NICU-01",
      status: "operational",
      riskLevel: "low",
      usageHours: 1500,
      failureCount: 0,
    },
    {
      name: "Siemens SOMATOM CT Scanner",
      category: "imaging",
      manufacturer: "Siemens",
      model: "SOMATOM",
      serialNumber: "SN-009",
      department: "Radiology",
      location: "CT Suite",
      status: "failed",
      riskLevel: "critical",
      usageHours: 9800,
      failureCount: 8,
    },
    {
      name: "Abbott i-STAT Analyzer",
      category: "laboratory",
      manufacturer: "Abbott",
      model: "i-STAT",
      serialNumber: "SN-010",
      department: "Laboratory",
      location: "Lab 01",
      status: "operational",
      riskLevel: "low",
      usageHours: 800,
      failureCount: 0,
    },
  ];

  const equipmentIds: string[] = [];

  for (const e of demoEquipment) {
    const ref = doc(collection(db, "equipment"));
    equipmentIds.push(ref.id);
    batch.set(ref, {
      ...e,
      hospitalId,
      notes: "",
      installDate: Timestamp.fromDate(new Date("2022-01-15")),
      lastMaintenanceDate: Timestamp.fromDate(new Date("2024-11-01")),
      nextMaintenanceDate: Timestamp.fromDate(new Date("2025-06-01")),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const now = new Date();
  const demoMaintenance = [
    {
      equipmentIdx: 0,
      type: "emergency",
      status: "completed",
      description: "Transducer replacement",
      technicianName: "Eze Chukwu",
      daysOffset: -30,
      downtime: 6,
      cost: 85000,
    },
    {
      equipmentIdx: 1,
      type: "preventive",
      status: "completed",
      description: "Annual calibration",
      technicianName: "Bola Adeyemi",
      daysOffset: -20,
      downtime: 2,
      cost: 12000,
    },
    {
      equipmentIdx: 2,
      type: "corrective",
      status: "in_progress",
      description: "Display unit replacement",
      technicianName: "Kemi Okafor",
      daysOffset: -2,
      downtime: 0,
      cost: 45000,
    },
    {
      equipmentIdx: 4,
      type: "preventive",
      status: "scheduled",
      description: "6-month preventive check",
      technicianName: "Eze Chukwu",
      daysOffset: 3,
      downtime: 0,
      cost: 0,
    },
    {
      equipmentIdx: 5,
      type: "inspection",
      status: "scheduled",
      description: "Probe calibration inspection",
      technicianName: "Bola Adeyemi",
      daysOffset: 5,
      downtime: 0,
      cost: 0,
    },
    {
      equipmentIdx: 6,
      type: "preventive",
      status: "scheduled",
      description: "Quarterly maintenance",
      technicianName: "Kemi Okafor",
      daysOffset: 7,
      downtime: 0,
      cost: 0,
    },
    {
      equipmentIdx: 7,
      type: "inspection",
      status: "scheduled",
      description: "Ventilator safety inspection",
      technicianName: "Eze Chukwu",
      daysOffset: 12,
      downtime: 0,
      cost: 0,
    },
    {
      equipmentIdx: 8,
      type: "emergency",
      status: "completed",
      description: "X-ray tube replacement",
      technicianName: "Kemi Okafor",
      daysOffset: -10,
      downtime: 48,
      cost: 320000,
    },
    {
      equipmentIdx: 3,
      type: "preventive",
      status: "completed",
      description: "Gas system maintenance",
      technicianName: "Bola Adeyemi",
      daysOffset: -45,
      downtime: 3,
      cost: 18000,
    },
    {
      equipmentIdx: 9,
      type: "inspection",
      status: "completed",
      description: "Reagent calibration check",
      technicianName: "Eze Chukwu",
      daysOffset: -60,
      downtime: 1,
      cost: 5000,
    },
  ];

  for (const m of demoMaintenance) {
    const ref = doc(collection(db, "maintenance"));
    const scheduledDate = new Date(
      now.getTime() + m.daysOffset * 24 * 60 * 60 * 1000,
    );
    batch.set(ref, {
      equipmentId: equipmentIds[m.equipmentIdx],
      equipmentName: demoEquipment[m.equipmentIdx].name,
      type: m.type,
      status: m.status,
      description: m.description,
      technicianId: userId,
      technicianName: m.technicianName,
      scheduledDate: Timestamp.fromDate(scheduledDate),
      completedDate:
        m.status === "completed" ?
          Timestamp.fromDate(
            new Date(scheduledDate.getTime() + m.downtime * 60 * 60 * 1000),
          )
        : null,
      downtime: m.downtime,
      cost: m.cost,
      partsReplaced: [],
      notes: "",
      hospitalId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function hasSeededData(hospitalId: string): Promise<boolean> {
  const q = query(
    collection(db, "equipment"),
    where("hospitalId", "==", hospitalId),
    limit(1),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
