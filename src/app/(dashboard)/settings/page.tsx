"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors flex-shrink-0",
        enabled ? "bg-blue-500" : (
          "bg-[var(--bg-elevated)] border border-[var(--border)]"
        ),
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          enabled ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

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

function SettingRow({
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

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="text-xs text-right bg-transparent border-0 outline-none text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] w-48 focus:text-[var(--text-primary)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      className="text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] outline-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("facility");

  // Facility
  const [facilityName, setFacilityName] = useState(
    "Lagos University Teaching Hospital",
  );
  const [facilityType, setFacilityType] = useState("Tertiary Hospital");
  const [adminEmail, setAdminEmail] = useState("biomedical@luth.gov.ng");
  const [adminPhone, setAdminPhone] = useState("+234 802 000 0001");
  const [timezone, setTimezone] = useState("Africa/Lagos");

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [maintenanceReminders, setMaintenanceReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // ML Model
  const [autoRetrain, setAutoRetrain] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState("70");
  const [predictionWindow, setPredictionWindow] = useState("30 days");
  const [dataCollection, setDataCollection] = useState(true);

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("8 hours");
  const [auditLog, setAuditLog] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS = [
    { id: "facility", icon: Building2, label: "Facility" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "model", icon: Cpu, label: "ML Model" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "account", icon: User, label: "Account" },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Tab nav */}
      <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-1 w-fit">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
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

      {/* Facility Settings */}
      {activeTab === "facility" && (
        <div className="space-y-4">
          <Section
            icon={Building2}
            title="Facility Information"
            description="Basic details about your healthcare facility"
          >
            <SettingRow label="Facility Name">
              <TextInput value={facilityName} onChange={setFacilityName} />
            </SettingRow>
            <SettingRow label="Facility Type">
              <SelectInput
                value={facilityType}
                onChange={setFacilityType}
                options={[
                  "Tertiary Hospital",
                  "Secondary Hospital",
                  "Primary Health Centre",
                  "Specialist Clinic",
                ]}
              />
            </SettingRow>
            <SettingRow label="Timezone">
              <SelectInput
                value={timezone}
                onChange={setTimezone}
                options={["Africa/Lagos", "Africa/Abuja", "UTC"]}
              />
            </SettingRow>
          </Section>

          <Section
            icon={User}
            title="Administrator Contact"
            description="Primary contact for system alerts and communications"
          >
            <SettingRow
              label="Email Address"
              description="Receives system alerts and reports"
            >
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Mail size={12} />
                <TextInput value={adminEmail} onChange={setAdminEmail} />
              </div>
            </SettingRow>
            <SettingRow
              label="Phone Number"
              description="For SMS alerts on critical failures"
            >
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Phone size={12} />
                <TextInput value={adminPhone} onChange={setAdminPhone} />
              </div>
            </SettingRow>
          </Section>

          <Section
            icon={Cpu}
            title="Equipment Thresholds"
            description="Set operational parameters for the facility"
          >
            <SettingRow
              label="Max Equipment Age Alert"
              description="Flag equipment older than this"
            >
              <SelectInput
                value="10 years"
                onChange={() => {}}
                options={["5 years", "8 years", "10 years", "15 years"]}
              />
            </SettingRow>
            <SettingRow
              label="Usage Hour Alert"
              description="Alert when usage exceeds this threshold"
            >
              <SelectInput
                value="10,000 hrs"
                onChange={() => {}}
                options={["5,000 hrs", "8,000 hrs", "10,000 hrs", "15,000 hrs"]}
              />
            </SettingRow>
          </Section>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <Section
            icon={Bell}
            title="Alert Channels"
            description="Choose how you receive maintenance and failure alerts"
          >
            <SettingRow
              label="Email Alerts"
              description="Send alerts to the administrator email"
            >
              <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
            </SettingRow>
            <SettingRow
              label="SMS Alerts"
              description="Send critical alerts via SMS"
            >
              <Toggle enabled={smsAlerts} onChange={setSmsAlerts} />
            </SettingRow>
            <SettingRow
              label="Critical Alerts Only"
              description="Suppress warning-level notifications"
            >
              <Toggle enabled={criticalOnly} onChange={setCriticalOnly} />
            </SettingRow>
          </Section>

          <Section
            icon={Mail}
            title="Scheduled Reports"
            description="Automatically delivered reports and summaries"
          >
            <SettingRow
              label="Daily Digest"
              description="Summary of equipment status each morning"
            >
              <Toggle enabled={dailyDigest} onChange={setDailyDigest} />
            </SettingRow>
            <SettingRow
              label="Maintenance Reminders"
              description="48h notice before scheduled maintenance"
            >
              <Toggle
                enabled={maintenanceReminders}
                onChange={setMaintenanceReminders}
              />
            </SettingRow>
            <SettingRow
              label="Weekly Report"
              description="Full performance report every Monday"
            >
              <Toggle enabled={weeklyReport} onChange={setWeeklyReport} />
            </SettingRow>
            <SettingRow label="Report Delivery Time">
              <SelectInput
                value="07:00 AM"
                onChange={() => {}}
                options={["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM"]}
              />
            </SettingRow>
          </Section>
        </div>
      )}

      {/* ML Model */}
      {activeTab === "model" && (
        <div className="space-y-4">
          {/* Model status card */}
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
                Last retrained: May 15, 2025 · Accuracy: 91.4% · Dataset: 4.2M
                records
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
            <SettingRow
              label="Auto-Retrain Model"
              description="Automatically retrain monthly with new data"
            >
              <Toggle enabled={autoRetrain} onChange={setAutoRetrain} />
            </SettingRow>
            <SettingRow
              label="Risk Alert Threshold"
              description="Minimum score to trigger a prediction alert"
            >
              <div className="flex items-center gap-2">
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
            </SettingRow>
            <SettingRow
              label="Prediction Window"
              description="How far ahead to forecast failure probability"
            >
              <SelectInput
                value={predictionWindow}
                onChange={setPredictionWindow}
                options={["7 days", "14 days", "30 days", "60 days", "90 days"]}
              />
            </SettingRow>
            <SettingRow
              label="Anonymous Data Sharing"
              description="Share anonymised data to improve the model"
            >
              <Toggle enabled={dataCollection} onChange={setDataCollection} />
            </SettingRow>
          </Section>

          <div className="card p-4 flex items-start gap-3 border-amber-500/20 bg-amber-500/5">
            <AlertTriangle
              size={15}
              className="text-amber-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-xs font-semibold text-amber-400">
                Model Retrain Recommended
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                7 new failure events recorded since last training. Retraining
                will improve prediction accuracy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <Section
            icon={Shield}
            title="Authentication"
            description="Control access and session security"
          >
            <SettingRow
              label="Two-Factor Authentication"
              description="Require OTP on every login"
            >
              <Toggle enabled={twoFactor} onChange={setTwoFactor} />
            </SettingRow>
            <SettingRow
              label="Session Timeout"
              description="Auto-logout after inactivity"
            >
              <SelectInput
                value={sessionTimeout}
                onChange={setSessionTimeout}
                options={["1 hour", "4 hours", "8 hours", "24 hours"]}
              />
            </SettingRow>
            <SettingRow
              label="Audit Log"
              description="Record all user actions for compliance"
            >
              <Toggle enabled={auditLog} onChange={setAuditLog} />
            </SettingRow>
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
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors"
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

      {/* Account */}
      {activeTab === "account" && (
        <div className="space-y-4">
          <Section
            icon={User}
            title="Profile"
            description="Your personal account information"
          >
            <SettingRow label="Full Name">
              <TextInput value="Dr. Adaeze Okonkwo" onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Role">
              <span className="text-xs text-[var(--text-muted)]">
                Chief Biomedical Engineer
              </span>
            </SettingRow>
            <SettingRow label="Email">
              <TextInput value="a.okonkwo@luth.gov.ng" onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Language">
              <SelectInput
                value="English (NG)"
                onChange={() => {}}
                options={[
                  "English (NG)",
                  "English (UK)",
                  "Yoruba",
                  "Igbo",
                  "Hausa",
                ]}
              />
            </SettingRow>
          </Section>

          <Section
            icon={Shield}
            title="Password"
            description="Change your account password"
          >
            <SettingRow label="Current Password">
              <input
                type="password"
                className="text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] outline-none w-36"
                placeholder="••••••••"
              />
            </SettingRow>
            <SettingRow label="New Password">
              <input
                type="password"
                className="text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] outline-none w-36"
                placeholder="••••••••"
              />
            </SettingRow>
          </Section>

          <div className="card p-4 border-red-500/20 bg-red-500/5">
            <p className="text-xs font-semibold text-red-400 mb-1">
              Danger Zone
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">
              Permanently delete your account and all associated data.
            </p>
            <button className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all",
            saved ?
              "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
            : "btn-primary",
          )}
        >
          {saved ?
            <>
              <CheckCircle2 size={15} /> Saved!
            </>
          : <>
              <Save size={15} /> Save Changes
            </>
          }
        </button>
      </div>
    </div>
  );
}
