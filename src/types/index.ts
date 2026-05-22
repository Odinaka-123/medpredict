export type UserRole = "admin" | "technician" | "viewer";

export interface HospitalUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  hospitalName: string;
  hospitalId: string;
  createdAt: Date;
}

export type EquipmentStatus =
  | "operational"
  | "maintenance"
  | "failed"
  | "decommissioned";
export type EquipmentCategory =
  | "imaging"
  | "laboratory"
  | "surgical"
  | "monitoring"
  | "life_support"
  | "other";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  department: string;
  status: EquipmentStatus;
  installDate: Date;
  lastMaintenanceDate: Date | null;
  nextMaintenanceDate: Date | null;
  usageHours: number;
  failureCount: number;
  riskLevel: RiskLevel;
  hospitalId: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MaintenanceType =
  | "preventive"
  | "corrective"
  | "emergency"
  | "inspection";
export type MaintenanceStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  technicianId: string;
  technicianName: string;
  scheduledDate: Date;
  completedDate: Date | null;
  downtime: number;
  cost: number;
  partsReplaced: string[];
  notes: string;
  hospitalId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PredictionResult {
  equipmentId: string;
  equipmentName: string;
  failureProbability: number;
  riskLevel: RiskLevel;
  estimatedDaysToFailure: number | null;
  recommendedAction: string;
  confidence: number;
  generatedAt: Date;
}

export interface DashboardStats {
  totalEquipment: number;
  operational: number;
  underMaintenance: number;
  failed: number;
  criticalRisk: number;
  maintenanceDueThisWeek: number;
  avgDowntime: number;
  totalMaintenanceCost: number;
}
