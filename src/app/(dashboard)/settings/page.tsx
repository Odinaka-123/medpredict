"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Shield,
  Building2,
  Cpu,
  User,
  Mail,
  Phone,
  Save,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

// ─── Toggle (fixed) ───────────────────────────────────────────────────────────
// Container: w-11 h-6. Thumb: w-5 h-5. Gap: 2px each side.
// Off: left=2px. On: left=calc(100% - 22px) via translate.

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex-shrink-0 focus:outline-none",
        enabled ? "bg-blue-500" : "bg-slate-700 border border-slate-600",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
          "absolute top-0.5",
          enabled ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
          <Icon size={15} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <p className="text-[11px] text-[var(--text-muted)]">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--text-primary)]">
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

const inp =
  "text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] outline-none focus:border-blue-500/50 transition w-48";
const sel =
  "text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] outline-none cursor-pointer focus:border-blue-500/50 transition";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState("facility");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Facility
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("Tertiary Hospital");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [timezone, setTimezone] = useState("Africa/Lagos");

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [maintenanceReminders, setMaintenanceReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // ML
  const [autoRetrain, setAutoRetrain] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState("70");
  const [predictionWindow, setPredictionWindow] = useState("30 days");
  const [dataCollection, setDataCollection] = useState(true);

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("8 hours");
  const [auditLog, setAuditLog] = useState(true);

  // Account
  const [displayName, setDisplayName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!profile || !user) return;
    setFacilityName(profile.hospitalName ?? "");
    setAdminEmail(user.email ?? "");
    setDisplayName(user.displayName ?? profile.displayName ?? "");
    setAccountEmail(user.email ?? "");

    async function loadSettings() {
      if (!profile?.hospitalId) return;
      try {
        const snap = await getDoc(
          doc(db, "hospitalSettings", profile.hospitalId),
        );
        if (snap.exists()) {
          const d = snap.data();
          setFacilityType(d.facilityType ?? "Tertiary Hospital");
          setAdminPhone(d.adminPhone ?? "");
          setTimezone(d.timezone ?? "Africa/Lagos");
          setEmailAlerts(d.emailAlerts ?? true);
          setSmsAlerts(d.smsAlerts ?? false);
          setCriticalOnly(d.criticalOnly ?? false);
          setDailyDigest(d.dailyDigest ?? true);
          setMaintenanceReminders(d.maintenanceReminders ?? true);
          setWeeklyReport(d.weeklyReport ?? false);
          setAutoRetrain(d.autoRetrain ?? true);
          setRiskThreshold(d.riskThreshold ?? "70");
          setPredictionWindow(d.predictionWindow ?? "30 days");
          setDataCollection(d.dataCollection ?? true);
          setTwoFactor(d.twoFactor ?? false);
          setSessionTimeout(d.sessionTimeout ?? "8 hours");
          setAuditLog(d.auditLog ?? true);
        }
      } catch {
        /* silent */
      }
    }
    loadSettings();
  }, [profile, user]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function flash(err?: string) {
    if (err) {
      setError(err);
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Save (facility / notifications / ML / security) ───────────────────────

  async function handleSave() {
    if (!profile?.hospitalId || !user) return;
    setError("");
    setSaving(true);
    try {
      // 1. Persist settings doc
      await setDoc(
        doc(db, "hospitalSettings", profile.hospitalId),
        {
          facilityName,
          facilityType,
          adminEmail,
          adminPhone,
          timezone,
          emailAlerts,
          smsAlerts,
          criticalOnly,
          dailyDigest,
          maintenanceReminders,
          weeklyReport,
          autoRetrain,
          riskThreshold,
          predictionWindow,
          dataCollection,
          twoFactor,
          sessionTimeout,
          auditLog,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      // 2. Sync facility name back to user profile so Sidebar reflects it immediately
      if (facilityName !== profile.hospitalName) {
        await updateDoc(doc(db, "users", user.uid), {
          hospitalName: facilityName,
        });
      }

      flash();
    } catch {
      flash("Failed to save settings. Please try again.");
    }
  }

  // ── Account: update display name ──────────────────────────────────────────

  async function handleSaveProfile() {
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      // Update Firebase Auth display name
      await updateProfile(user, { displayName });
      // Sync to Firestore user doc so Header re-reads it
      await updateDoc(doc(db, "users", user.uid), { displayName });
      flash();
    } catch {
      flash("Failed to update profile.");
    }
  }

  // ── Account: update email ─────────────────────────────────────────────────

  async function handleEmailChange() {
    if (!user || !accountEmail || accountEmail === user.email) return;
    setError("");
    setSaving(true);
    try {
      await updateEmail(user, accountEmail);
      await updateDoc(doc(db, "users", user.uid), { email: accountEmail });
      flash();
    } catch {
      flash("Email update failed — please re-login and try again.");
    }
  }

  // ── Account: change password ──────────────────────────────────────────────

  async function handlePasswordChange() {
    if (!user || !currentPwd || !newPwd) return;
    if (newPwd !== confirmPwd) {
      setError("New passwords don't match.");
      return;
    }
    if (newPwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email!, currentPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      flash();
    } catch {
      flash("Incorrect current password.");
    }
  }

  // ── Account: delete ───────────────────────────────────────────────────────

  async function handleDeleteAccount() {
    if (!user || deleteConfirm !== "DELETE") return;
    if (
      !confirm(
        "This will permanently delete your account. Are you absolutely sure?",
      )
    )
      return;
    try {
      await deleteUser(user);
      window.location.href = "/login";
    } catch {
      setError("Delete failed — please re-login and try again.");
    }
  }

  const TABS = [
    { id: "facility", icon: Building2, label: "Facility" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "model", icon: Cpu, label: "ML Model" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "account", icon: User, label: "Account" },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setError("");
            }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
              activeTab === id ?
                "bg-blue-500/20 text-blue-400 border border-blue-500/25"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]",
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3">
          <AlertTriangle size={13} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── FACILITY ── */}
      {activeTab === "facility" && (
        <div className="space-y-4">
          <Section
            icon={Building2}
            title="Facility Information"
            description="Basic details about your healthcare facility"
          >
            <Row label="Facility Name">
              <input
                className={inp}
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="Hospital name"
              />
            </Row>
            <Row label="Facility Type">
              <select
                className={sel}
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
              >
                {[
                  "Tertiary Hospital",
                  "Secondary Hospital",
                  "Primary Health Centre",
                  "Specialist Clinic",
                ].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Timezone">
              <select
                className={sel}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {["Africa/Lagos", "Africa/Abuja", "UTC"].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Row>
          </Section>

          <Section
            icon={User}
            title="Administrator Contact"
            description="Primary contact for system alerts"
          >
            <Row
              label="Email Address"
              description="Receives system alerts and reports"
            >
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-[var(--text-muted)]" />
                <input
                  className={inp}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@hospital.ng"
                />
              </div>
            </Row>
            <Row
              label="Phone Number"
              description="For SMS alerts on critical failures"
            >
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-[var(--text-muted)]" />
                <input
                  className={inp}
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </Row>
          </Section>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <Section
            icon={Bell}
            title="Alert Channels"
            description="Choose how you receive maintenance and failure alerts"
          >
            <Row
              label="Email Alerts"
              description="Send alerts to the administrator email"
            >
              <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
            </Row>
            <Row label="SMS Alerts" description="Send critical alerts via SMS">
              <Toggle enabled={smsAlerts} onChange={setSmsAlerts} />
            </Row>
            <Row
              label="Critical Alerts Only"
              description="Suppress warning-level notifications"
            >
              <Toggle enabled={criticalOnly} onChange={setCriticalOnly} />
            </Row>
          </Section>
          <Section
            icon={Mail}
            title="Scheduled Reports"
            description="Automatically delivered reports and summaries"
          >
            <Row
              label="Daily Digest"
              description="Summary of equipment status each morning"
            >
              <Toggle enabled={dailyDigest} onChange={setDailyDigest} />
            </Row>
            <Row
              label="Maintenance Reminders"
              description="48h notice before scheduled maintenance"
            >
              <Toggle
                enabled={maintenanceReminders}
                onChange={setMaintenanceReminders}
              />
            </Row>
            <Row
              label="Weekly Report"
              description="Full performance report every Monday"
            >
              <Toggle enabled={weeklyReport} onChange={setWeeklyReport} />
            </Row>
          </Section>
        </div>
      )}

      {/* ── ML MODEL ── */}
      {activeTab === "model" && (
        <div className="space-y-4">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Cpu size={20} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  MedPredict ML v2.1
                </p>
                <span className="badge badge-success">Active</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Accuracy: 91.4% · Dataset: 4.2M records
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Retrain Now <ChevronRight size={12} />
            </button>
          </div>
          <Section
            icon={Cpu}
            title="Prediction Settings"
            description="Configure how the AI model generates risk predictions"
          >
            <Row
              label="Auto-Retrain Model"
              description="Automatically retrain monthly with new data"
            >
              <Toggle enabled={autoRetrain} onChange={setAutoRetrain} />
            </Row>
            <Row
              label="Risk Alert Threshold"
              description="Minimum score to trigger a prediction alert"
            >
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={90}
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(e.target.value)}
                  className="w-24 accent-blue-500"
                />
                <span className="text-xs font-bold text-blue-400 w-8">
                  {riskThreshold}%
                </span>
              </div>
            </Row>
            <Row
              label="Prediction Window"
              description="How far ahead to forecast failure probability"
            >
              <select
                className={sel}
                value={predictionWindow}
                onChange={(e) => setPredictionWindow(e.target.value)}
              >
                {["7 days", "14 days", "30 days", "60 days", "90 days"].map(
                  (o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ),
                )}
              </select>
            </Row>
            <Row
              label="Anonymous Data Sharing"
              description="Share anonymised data to improve the model"
            >
              <Toggle enabled={dataCollection} onChange={setDataCollection} />
            </Row>
          </Section>
        </div>
      )}

      {/* ── SECURITY ── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <Section
            icon={Shield}
            title="Authentication"
            description="Control access and session security"
          >
            <Row
              label="Two-Factor Authentication"
              description="Require OTP on every login"
            >
              <Toggle enabled={twoFactor} onChange={setTwoFactor} />
            </Row>
            <Row
              label="Session Timeout"
              description="Auto-logout after inactivity"
            >
              <select
                className={sel}
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
              >
                {["1 hour", "4 hours", "8 hours", "24 hours"].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Row>
            <Row
              label="Audit Log"
              description="Record all user actions for compliance"
            >
              <Toggle enabled={auditLog} onChange={setAuditLog} />
            </Row>
          </Section>
          <Section
            icon={Shield}
            title="Access Control"
            description="Manage roles and permissions"
          >
            {[
              { role: "Biomedical Engineer", count: 3, badge: "badge-blue" },
              { role: "Department Head", count: 7, badge: "badge-info" },
              { role: "Technician", count: 12, badge: "badge-success" },
              { role: "Administrator", count: 2, badge: "badge-danger" },
            ].map((r) => (
              <div
                key={r.role}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">
                    {r.role}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {r.count} users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${r.badge}`}>{r.count}</span>
                  <ChevronRight
                    size={13}
                    className="text-[var(--text-muted)]"
                  />
                </div>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ── ACCOUNT ── */}
      {activeTab === "account" && (
        <div className="space-y-4">
          {/* Profile */}
          <Section
            icon={User}
            title="Profile"
            description="Your personal account information"
          >
            <Row label="Full Name">
              <input
                className={inp}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
              />
            </Row>
            <Row label="Role">
              <span className="text-xs text-[var(--text-muted)] capitalize">
                {profile?.role ?? "—"}
              </span>
            </Row>
            <Row label="Hospital">
              <span className="text-xs text-[var(--text-muted)] truncate max-w-[180px] block">
                {profile?.hospitalName ?? "—"}
              </span>
            </Row>
          </Section>
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 btn-primary text-sm px-4 py-2 disabled:opacity-50"
            >
              {saving ?
                <Loader2 size={13} className="animate-spin" />
              : saved ?
                <CheckCircle2 size={13} />
              : <Save size={13} />}
              {saving ?
                "Saving…"
              : saved ?
                "Saved!"
              : "Save Profile"}
            </button>
          </div>

          {/* Email */}
          <Section
            icon={Mail}
            title="Email Address"
            description="Update the email tied to your account"
          >
            <Row
              label="Email"
              description="You may need to re-login after changing"
            >
              <input
                className={inp}
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="you@hospital.ng"
              />
            </Row>
          </Section>
          {accountEmail !== (user?.email ?? "") && (
            <div className="flex justify-end">
              <button
                onClick={handleEmailChange}
                disabled={saving}
                className="flex items-center gap-2 btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                {saving ?
                  <Loader2 size={13} className="animate-spin" />
                : <Mail size={13} />}
                Update Email
              </button>
            </div>
          )}

          {/* Password */}
          <Section
            icon={Shield}
            title="Change Password"
            description="Update your account password"
          >
            <Row label="Current Password">
              <input
                type="password"
                className={inp}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
              />
            </Row>
            <Row label="New Password">
              <input
                type="password"
                className={inp}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </Row>
            <Row label="Confirm Password">
              <input
                type="password"
                className={inp}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Repeat new password"
              />
            </Row>
          </Section>
          {currentPwd && newPwd && confirmPwd && (
            <div className="flex justify-end">
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="flex items-center gap-2 btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                {saving ?
                  <Loader2 size={13} className="animate-spin" />
                : <Shield size={13} />}
                Update Password
              </button>
            </div>
          )}

          {/* Danger zone */}
          <div className="card p-5 border-red-500/20 bg-red-500/5">
            <p className="text-xs font-semibold text-red-400 mb-1">
              Danger Zone
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">
              Type{" "}
              <span className="font-mono font-bold text-red-400">DELETE</span>{" "}
              to permanently remove your account and all associated data. This
              cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <input
                className="text-xs bg-[var(--bg-elevated)] border border-red-500/30 rounded-lg px-2.5 py-1.5 text-red-400 outline-none w-32 placeholder:text-red-400/40 focus:border-red-500"
                placeholder="Type DELETE"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE"}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global save bar for facility / notifications / ML / security */}
      {activeTab !== "account" && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all",
              saved ?
                "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
              : "btn-primary",
            )}
          >
            {saving ?
              <Loader2 size={15} className="animate-spin" />
            : saved ?
              <CheckCircle2 size={15} />
            : <Save size={15} />}
            {saving ?
              "Saving…"
            : saved ?
              "Saved!"
            : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
