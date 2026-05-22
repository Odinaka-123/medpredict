"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFacilitySettings,
  getNotificationSettings,
  getMLSettings,
  getSecuritySettings,
  getUserProfile,
  saveFacilitySettings,
  saveNotificationSettings,
  saveMLSettings,
  saveSecuritySettings,
  saveUserProfile,
  DEFAULT_FACILITY,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_ML,
  type FacilitySettings,
  type NotificationSettings,
  type MLSettings,
  type SecuritySettings,
  type UserProfile,
} from "@/lib/settings";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SettingsState {
  facility: FacilitySettings;
  notifications: NotificationSettings;
  ml: MLSettings;
  security: SecuritySettings;
  profile: UserProfile | null;
}

export function useSettings() {
  const [data, setData] = useState<SettingsState>({
    facility: DEFAULT_FACILITY,
    notifications: DEFAULT_NOTIFICATIONS,
    ml: DEFAULT_ML,
    security: { twoFactor: false, sessionTimeout: "8 hours", auditLog: true },
    profile: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Load all settings in parallel on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getFacilitySettings(),
      getNotificationSettings(),
      getMLSettings(),
      getSecuritySettings(),
      getUserProfile(),
    ])
      .then(([facility, notifications, ml, security, profile]) => {
        if (cancelled) return;
        setData({ facility, notifications, ml, security, profile });
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load settings:", err);
        setError("Failed to load settings. Using defaults.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Generic field updater — keeps optimistic local state
  const updateField = useCallback(
    <
      G extends keyof SettingsState,
      F extends keyof NonNullable<SettingsState[G]>,
    >(
      group: G,
      field: F,
      value: NonNullable<SettingsState[G]>[F],
    ) => {
      setData((prev) => {
        const currentGroup = prev[group];

        if (currentGroup === null) {
          return {
            ...prev,
            [group]: { [field]: value } as unknown as SettingsState[G],
          };
        }

        return {
          ...prev,
          [group]: {
            ...currentGroup,
            [field]: value,
          } as SettingsState[G],
        };
      });

      setSaveStatus((s) => (s === "saved" ? "idle" : s));
    },
    [],
  );

  // Save a specific group
  const saveGroup = useCallback(
    async (group: keyof SettingsState) => {
      setSaveStatus("saving");
      try {
        switch (group) {
          case "facility":
            await saveFacilitySettings(data.facility);
            break;
          case "notifications":
            await saveNotificationSettings(data.notifications);
            break;
          case "ml":
            await saveMLSettings(data.ml);
            break;
          case "security":
            await saveSecuritySettings(data.security);
            break;
          case "profile":
            if (data.profile) {
              // Creating a clean copy and deleting metadata keys explicitly
              // instead of destructuring avoids creating unread variables entirely.
              const cleanProfile = { ...data.profile } as Record<
                string,
                unknown
              >;
              delete cleanProfile.uid;
              delete cleanProfile.updatedAt;

              await saveUserProfile(cleanProfile as Omit<UserProfile, "uid">);
            }
            break;
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch (err) {
        console.error(`Failed to save ${group}:`, err);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [data],
  );

  // Save ALL groups at once (used by the sticky save bar)
  const saveAll = useCallback(async () => {
    setSaveStatus("saving");
    try {
      // Helper function to cleanly strip properties without destructuring leaks
      const stripMetadata = (profileObj: UserProfile) => {
        const cleanObj = { ...profileObj } as Record<string, unknown>;
        delete cleanObj.uid;
        delete cleanObj.updatedAt;
        return cleanObj as Omit<UserProfile, "uid">;
      };

      await Promise.all([
        saveFacilitySettings(data.facility),
        saveNotificationSettings(data.notifications),
        saveMLSettings(data.ml),
        saveSecuritySettings(data.security),
        data.profile ?
          saveUserProfile(stripMetadata(data.profile))
        : Promise.resolve(),
      ]);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [data]);

  return {
    data,
    loading,
    error,
    saveStatus,
    updateField,
    saveGroup,
    saveAll,
  };
}
