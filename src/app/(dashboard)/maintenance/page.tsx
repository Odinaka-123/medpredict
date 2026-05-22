"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Wrench,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenanceRecord {
  id: string;
  equipment: string;
  dept: string;
  type: string;
  status: string;
  date: string;
  tech: string;
  duration: number | null;
  cost: number | null;
  findings: string | null;
}

interface StatItem {
  label: string;
  value: string;
  type: string;
}

const TYPE_BADGE: Record<string, string> = {
  preventive: "badge-success",
  corrective: "badge-warning",
  emergency: "badge-danger",
  calibration: "badge-blue",
  inspection: "badge-info",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; cls: string }
> = {
  completed: { label: "Completed", icon: CheckCircle, cls: "text-emerald-400" },
  in_progress: { label: "In Progress", icon: Clock, cls: "text-blue-400" },
  scheduled: { label: "Scheduled", icon: Calendar, cls: "text-amber-400" },
  cancelled: { label: "Cancelled", icon: XCircle, cls: "text-slate-400" },
};

const STAT_ICON_MAP: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  total: { icon: Wrench, color: "bg-blue-500/15 text-blue-400" },
  completed: { icon: CheckCircle, color: "bg-emerald-500/15 text-emerald-400" },
  in_progress: { icon: Clock, color: "bg-indigo-500/15 text-indigo-400" },
  upcoming: { icon: Calendar, color: "bg-amber-500/15 text-amber-400" },
};

export default function MaintenancePage() {
  // Core Visual Engine State
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Filters Lifecycle State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Field Interactive Value Tracking State
  const [formEquipment, setFormEquipment] = useState("");
  const [formDept, setFormDept] = useState("Radiology");
  const [formType, setFormType] = useState("preventive");
  const [formDate, setFormDate] = useState("");
  const [formTech, setFormTech] = useState("");
  const [formFindings, setFormFindings] = useState("");

  // Reusable retrieval hook wrapper
  async function loadDataPipeline() {
    try {
      const res = await fetch("/api/maintenance");
      if (!res.ok)
        throw new Error(
          "Could not extract active log history database parameters.",
        );
      const data = await res.json();
      setRecords(data.records);
      setStats(data.stats);

      // Auto-populate default text field options safely
      if (data.records.length > 0 && !formEquipment) {
        setFormEquipment(data.records[0].equipment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDataPipeline();
  }, []);

  // Form Creation POST Event Pipeline
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment: formEquipment,
          dept: formDept,
          type: formType,
          date: formDate,
          tech: formTech,
          findings: formFindings,
        }),
      });

      if (!response.ok)
        throw new Error(
          "Could not successfully record maintenance entry parameters.",
        );

      // Clear input fields safely
      setFormTech("");
      setFormFindings("");
      setShowForm(false);

      // Instantly query updated data map values cleanly
      await loadDataPipeline();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = records.filter((r) => {
    const ms = r.equipment.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === "all" || r.type === typeFilter;
    return ms && mt;
  });

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
        <AlertCircle className="mx-auto mb-2" size={24} />
        <p className="font-semibold">Engine Pipeline Interrupted</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Dynamic Statistics Panel Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ?
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card p-4 h-20 animate-pulse bg-slate-900/40 border border-slate-800"
            />
          ))
        : stats.map((s) => {
            const cfg = STAT_ICON_MAP[s.type] || {
              icon: Wrench,
              color: "bg-slate-500/10 text-slate-400",
            };
            const Icon = cfg.icon;
            return (
              <div key={s.label} className="card p-4 flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    cfg.color,
                  )}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {s.value}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                </div>
              </div>
            );
          })
        }
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              className="pl-9 pr-3 py-2 text-sm w-60"
              placeholder="Search records…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1">
            {[
              "all",
              "preventive",
              "corrective",
              "emergency",
              "calibration",
            ].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                  typeFilter === t ?
                    "bg-blue-500/20 text-blue-400 border border-blue-500/25"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                )}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> Log Maintenance
        </button>
      </div>

      {/* Primary Log History Records Table View */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                {[
                  "Equipment",
                  "Type",
                  "Status",
                  "Date",
                  "Technician",
                  "Duration",
                  "Cost (₦)",
                  "Findings",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ?
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-xs text-[var(--text-muted)]"
                  >
                    <Loader2
                      className="animate-spin mx-auto mb-2 text-blue-500"
                      size={18}
                    />
                    Processing equipment logs...
                  </td>
                </tr>
              : filtered.length === 0 ?
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-xs text-[var(--text-muted)]"
                  >
                    No log parameters match active search scopes.
                  </td>
                </tr>
              : filtered.map((r) => {
                  const sc = STATUS_CONFIG[r.status] || {
                    label: r.status,
                    icon: Wrench,
                    cls: "text-slate-400",
                  };
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[var(--bg-elevated)] transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[var(--text-primary)] max-w-[180px] truncate">
                          {r.equipment}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {r.dept}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${TYPE_BADGE[r.type]} capitalize`}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-medium ${sc.cls}`}
                        >
                          <sc.icon size={13} />
                          {sc.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {r.tech}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {r.duration ? `${r.duration}h` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {r.cost ? r.cost.toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)] max-w-[200px] truncate">
                        {r.findings ?? "—"}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {filtered.length} of {records.length} records
          </p>
        </div>
      </div>

      {/* Interactive Modal Insertion Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <form
            className="card p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmitRecord}
          >
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
              Log Maintenance Record
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                  Equipment Target
                </label>
                <select
                  className="w-full px-3 py-2 text-sm"
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value)}
                >
                  {records.map((r) => (
                    <option key={r.id} value={r.equipment}>
                      {r.equipment}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                    Department Area
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                  >
                    {[
                      "Radiology",
                      "ICU",
                      "NICU",
                      "Surgery",
                      "Laboratory",
                      "Obstetrics",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                    Type Classification
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    {[
                      "preventive",
                      "corrective",
                      "emergency",
                      "calibration",
                      "inspection",
                    ].map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 text-sm"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                    Assigned Specialist Technician
                  </label>
                  <input
                    required
                    className="w-full px-3 py-2 text-sm"
                    placeholder="Technician name"
                    value={formTech}
                    onChange={(e) => setFormTech(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                  Diagnostics / Clinical Findings
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm h-20 resize-none"
                  placeholder="Describe operational updates or system damage parameters verified..."
                  value={formFindings}
                  onChange={(e) => setFormFindings(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-sm flex items-center gap-1.5"
                >
                  {isSubmitting && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  Save New Entry
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
