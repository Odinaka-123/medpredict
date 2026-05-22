/**
 * lib/settings.ts
 * Firestore read/write helpers for all MedPredict settings groups.
 *
 * Collections:
 *   settings/facility       — facility-wide config
 *   settings/notifications  — alert channels & schedules
 *   settings/ml             — ML model configuration
 *   settings/security       — auth & access control
 *   users/{uid}             — per-user profile data
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

// ─── Typed Interfaces ─────────────────────────────────────────────────────────

export interface FacilitySettings {
  facilityName: string;
  facilityType: string;
  timezone: string;
  adminEmail: string;
  adminPhone: string;
  maxEquipmentAgeAlert: string;
  usageHourAlert: string;
  updatedAt?: unknown;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
  maintenanceReminders: boolean;
  weeklyReport: boolean;
  reportDeliveryTime: string;
  updatedAt?: unknown;
}

export interface MLSettings {
  autoRetrain: boolean;
  riskThreshold: number;
  predictionWindow: string;
  dataSharing: boolean;
  updatedAt?: unknown;
}

export interface SecuritySettings {
  twoFactor: boolean;
  sessionTimeout: string;
  auditLog: boolean;
  updatedAt?: unknown;
}

export interface UserProfile {
  displayName: string;
  email: string;
  role: string;
  language: string;
  uid: string;
  updatedAt?: unknown;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_FACILITY: FacilitySettings = {
  facilityName: "Lagos University Teaching Hospital",
  facilityType: "Tertiary Hospital",
  timezone: "Africa/Lagos",
  adminEmail: "biomedical@luth.gov.ng",
  adminPhone: "+234 802 000 0001",
  maxEquipmentAgeAlert: "10 years",
  usageHourAlert: "10,000 hrs",
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailAlerts: true,
  smsAlerts: true,
  criticalOnly: false,
  dailyDigest: true,
  maintenanceReminders: true,
  weeklyReport: false,
  reportDeliveryTime: "07:00 AM",
};

export const DEFAULT_ML: MLSettings = {
  autoRetrain: true,
  riskThreshold: 70,
  predictionWindow: "30 days",
  dataSharing: true,
};

export const DEFAULT_SECURITY: SecuritySettings = {
  twoFactor: false,
  sessionTimeout: "8 hours",
  auditLog: true,
};

// ─── Generic helpers ──────────────────────────────────────────────────────────

async function getSettingsDoc<T>(docId: string, defaults: T): Promise<T> {
  const ref = doc(db, "settings", docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return defaults;
  return { ...defaults, ...snap.data() } as T;
}

async function saveSettingsDoc<T extends object>(
  docId: string,
  data: T,
): Promise<void> {
  const ref = doc(db, "settings", docId);
  const snap = await getDoc(ref);
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, payload);
  }
}

// ─── Facility ─────────────────────────────────────────────────────────────────

export async function getFacilitySettings(): Promise<FacilitySettings> {
  return getSettingsDoc("facility", DEFAULT_FACILITY);
}

export async function saveFacilitySettings(
  data: Omit<FacilitySettings, "updatedAt">,
): Promise<void> {
  return saveSettingsDoc("facility", data);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return getSettingsDoc("notifications", DEFAULT_NOTIFICATIONS);
}

export async function saveNotificationSettings(
  data: Omit<NotificationSettings, "updatedAt">,
): Promise<void> {
  return saveSettingsDoc("notifications", data);
}

// ─── ML Model ─────────────────────────────────────────────────────────────────

export async function getMLSettings(): Promise<MLSettings> {
  return getSettingsDoc("ml", DEFAULT_ML);
}

export async function saveMLSettings(
  data: Omit<MLSettings, "updatedAt">,
): Promise<void> {
  return saveSettingsDoc("ml", data);
}

// ─── Security ─────────────────────────────────────────────────────────────────

export async function getSecuritySettings(): Promise<SecuritySettings> {
  return getSettingsDoc("security", DEFAULT_SECURITY);
}

export async function saveSecuritySettings(
  data: Omit<SecuritySettings, "updatedAt">,
): Promise<void> {
  return saveSettingsDoc("security", data);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const base: UserProfile = {
    uid: user.uid,
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    role: "Biomedical Engineer",
    language: "English (NG)",
  };

  if (!snap.exists()) return base;
  return { ...base, ...snap.data() } as UserProfile;
}

export async function saveUserProfile(
  data: Omit<UserProfile, "uid" | "updatedAt">,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const payload = { ...data, uid: user.uid, updatedAt: serverTimestamp() };
  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, payload);
  }
}
