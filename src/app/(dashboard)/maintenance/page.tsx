"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Wrench,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ApiStat {
  label: string;
  value: string;
  type: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  preventive: "badge-success",
  corrective: "badge-warning",
  emergency: "badge-danger",
  inspection: "badge-blue",
  calibration: "badge-blue",
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

const STAT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  total: { icon: Wrench, color: "bg-blue-500/15 text-blue-400" },
  completed: { icon: CheckCircle, color: "bg-emerald-500/15 text-emerald-400" },
  in_progress: { icon: Clock, color: "bg-indigo-500/15 text-indigo-400" },
  upcoming: { icon: Calendar, color: "bg-amber-500/15 text-amber-400" },
};

const TYPES = [
  "preventive",
  "corrective",
  "emergency",
  "inspection",
  "calibration",
];

function fmt(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCost(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

// ─── Log Maintenance Modal ────────────────────────────────────────────────────

function LogMaintenanceModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    equipment: "",
    dept: "Radiology",
    type: "preventive",
    tech: "",
    date: new Date().toISOString().split("T")[0],
    duration: 0,
    cost: 0,
    findings: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "duration" || name === "cost" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      onSaved();
      onClose();
    } catch {
      setError("Failed to save record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-blue-500 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";
  const lbl = "block text-xs font-medium text-slate-400 mb-1.5";

  const DEPARTMENTS = [
    "Radiology",
    "ICU",
    "NICU",
    "Surgery",
    "Laboratory",
    "Obstetrics",
    "Cardiology",
    "Theatre",
    "Emergency",
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Log Maintenance</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Record a maintenance activity
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={lbl}>Equipment name *</label>
            <input
              name="equipment"
              required
              value={form.equipment}
              onChange={handleChange}
              placeholder="e.g. Siemens ACUSON X700 Ultrasound"
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Department</label>
              <select
                name="dept"
                value={form.dept}
                onChange={handleChange}
                className={inp}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} className="bg-slate-800">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={inp}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-800 capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Technician *</label>
              <input
                name="tech"
                required
                value={form.tech}
                onChange={handleChange}
                placeholder="e.g. Eze Chukwu"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Scheduled date *</label>
              <input
                name="date"
                type="date"
                required
                value={form.date}
                onChange={handleChange}
                className={inp}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Duration (hours)</label>
              <input
                name="duration"
                type="number"
                min={0}
                value={form.duration}
                onChange={handleChange}
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Cost (₦)</label>
              <input
                name="cost"
                type="number"
                min={0}
                value={form.cost}
                onChange={handleChange}
                className={inp}
              />
            </div>
          </div>
          <div>
            <label className={lbl}>Findings / notes</label>
            <textarea
              name="findings"
              value={form.findings ?? ""}
              onChange={handleChange}
              rows={3}
              placeholder="Additional findings or observations…"
              className={`${inp} resize-none`}
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl py-2.5 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : "Save record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [apiStats, setApiStats] = useState<ApiStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance");
      const data = await res.json();
      setRecords(data.records ?? []);
      setApiStats(data.stats ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this maintenance record?")) return;
    // Optimistic removal — add a DELETE endpoint to your route if you need persistence
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = records.filter((r) => {
    const matchSearch =
      r.equipment.toLowerCase().includes(search.toLowerCase()) ||
      r.tech.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (typeFilter === "all" || r.type === typeFilter);
  });

  return (
    <div className="space-y-5 fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ?
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="card p-4 h-20 animate-pulse bg-slate-900/40 border border-slate-800"
              />
            ))
        : apiStats.map((s) => {
            const cfg = STAT_ICONS[s.type] ?? STAT_ICONS.total;
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
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
            {["all", ...TYPES].map((t) => (
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
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> Log Maintenance
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                {[
                  "Equipment",
                  "Dept",
                  "Type",
                  "Status",
                  "Date",
                  "Technician",
                  "Duration",
                  "Cost",
                  "Actions",
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
              {loading ?
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      {Array(9)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))
              : filtered.length === 0 ?
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-xs text-[var(--text-muted)]"
                  >
                    {records.length === 0 ?
                      'No records yet. Click "Log Maintenance" to add one.'
                    : "No records match your search."}
                  </td>
                </tr>
              : filtered.map((r) => {
                  const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.scheduled;
                  const StatusIcon = sc.icon;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[var(--text-primary)] max-w-[180px] truncate">
                          {r.equipment}
                        </p>
                        {r.findings && (
                          <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[180px]">
                            {r.findings}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {r.dept}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${TYPE_BADGE[r.type] ?? "badge-info"} capitalize`}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-medium ${sc.cls}`}
                        >
                          <StatusIcon size={13} />
                          {sc.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                        {fmt(r.date)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {r.tech}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {r.duration ? `${r.duration}h` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {formatCost(r.cost)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
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
            {loading ?
              "Loading…"
            : `Showing ${filtered.length} of ${records.length} records`}
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <LogMaintenanceModal
          onClose={() => setShowModal(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
