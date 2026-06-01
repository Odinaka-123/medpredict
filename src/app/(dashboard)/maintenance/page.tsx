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
import { useAuth } from "@/hooks/useAuth";
import {
  getMaintenanceRecords,
  getEquipment,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from "@/lib/firestore";
import {
  MaintenanceRecord,
  Equipment,
  MaintenanceType,
  MaintenanceStatus,
} from "@/types";

const TYPE_BADGE: Record<string, string> = {
  preventive: "badge-success",
  corrective: "badge-warning",
  emergency: "badge-danger",
  inspection: "badge-blue",
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

const TYPES: MaintenanceType[] = [
  "preventive",
  "corrective",
  "emergency",
  "inspection",
];
const STATUSES: MaintenanceStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

function fmt(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function formatCost(n: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

function LogMaintenanceModal({
  hospitalId,
  userId,
  equipment,
  onClose,
  onSaved,
}: {
  hospitalId: string;
  userId: string;
  equipment: Equipment[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    equipmentId: equipment[0]?.id ?? "",
    equipmentName: equipment[0]?.name ?? "",
    type: "preventive" as MaintenanceType,
    status: "scheduled" as MaintenanceStatus,
    description: "",
    technicianName: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    downtime: 0,
    cost: 0,
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    if (name === "equipmentId") {
      const eq = equipment.find((e) => e.id === value);
      setForm((f) => ({
        ...f,
        equipmentId: value,
        equipmentName: eq?.name ?? "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: name === "downtime" || name === "cost" ? Number(value) : value,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addMaintenanceRecord({
        equipmentId: form.equipmentId,
        equipmentName: form.equipmentName,
        type: form.type,
        status: form.status,
        description: form.description,
        technicianId: userId,
        technicianName: form.technicianName,
        scheduledDate: new Date(form.scheduledDate),
        completedDate: form.status === "completed" ? new Date() : null,
        downtime: form.downtime,
        cost: form.cost,
        partsReplaced: [],
        notes: form.notes,
        hospitalId,
      });
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
            <label className={lbl}>Equipment *</label>
            {equipment.length === 0 ?
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl px-4 py-3">
                No equipment found — add equipment first before logging
                maintenance.
              </div>
            : <select
                name="equipmentId"
                value={form.equipmentId}
                onChange={handleChange}
                className={inp}
              >
                {equipment.map((e) => (
                  <option key={e.id} value={e.id} className="bg-slate-800">
                    {e.name} — {e.department}
                  </option>
                ))}
              </select>
            }
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className={lbl}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inp}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-slate-800 capitalize">
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Description *</label>
            <input
              name="description"
              required
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Annual calibration and inspection"
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Technician name *</label>
              <input
                name="technicianName"
                required
                value={form.technicianName}
                onChange={handleChange}
                placeholder="e.g. Eze Chukwu"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Scheduled date *</label>
              <input
                name="scheduledDate"
                type="date"
                required
                value={form.scheduledDate}
                onChange={handleChange}
                className={inp}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Downtime (hours)</label>
              <input
                name="downtime"
                type="number"
                min={0}
                value={form.downtime}
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
            <label className={lbl}>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
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
              disabled={saving || equipment.length === 0}
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

export default function MaintenancePage() {
  const { profile, user } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (hospitalId: string) => {
    setLoading(true);
    try {
      const [r, e] = await Promise.all([
        getMaintenanceRecords(hospitalId),
        getEquipment(hospitalId),
      ]);
      setRecords(r);
      setEquipment(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to resolve
    if (profile === undefined) return;
    // Auth resolved — hospitalId either exists or doesn't
    if (profile?.hospitalId) {
      load(profile.hospitalId);
    } else {
      setLoading(false); // No hospitalId → show empty state immediately
    }
  }, [profile, load]);

  async function handleStatusChange(id: string, status: MaintenanceStatus) {
    await updateMaintenanceRecord(id, {
      status,
      completedDate: status === "completed" ? new Date() : null,
    });
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this maintenance record?")) return;
    setDeletingId(id);
    try {
      await deleteMaintenanceRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = records.filter((r) => {
    const matchSearch =
      r.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      r.technicianName.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (typeFilter === "all" || r.type === typeFilter);
  });

  const stats = [
    {
      label: "Total Records",
      value: records.length,
      color: "bg-blue-500/15 text-blue-400",
      icon: Wrench,
    },
    {
      label: "Completed",
      value: records.filter((r) => r.status === "completed").length,
      color: "bg-emerald-500/15 text-emerald-400",
      icon: CheckCircle,
    },
    {
      label: "In Progress",
      value: records.filter((r) => r.status === "in_progress").length,
      color: "bg-indigo-500/15 text-indigo-400",
      icon: Clock,
    },
    {
      label: "Scheduled",
      value: records.filter((r) => r.status === "scheduled").length,
      color: "bg-amber-500/15 text-amber-400",
      icon: Calendar,
    },
  ];

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
        : stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-4 flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    s.color,
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

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
            <Wrench size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            No maintenance records yet
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs">
            Click &ldquo;Log Maintenance&rdquo; to record your first activity.
            {equipment.length === 0 && " You'll need to add equipment first."}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm mt-2"
          >
            <Plus size={15} /> Log Maintenance
          </button>
        </div>
      )}

      {/* Toolbar */}
      {(loading || records.length > 0) && (
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
              {[
                "all",
                "preventive",
                "corrective",
                "emergency",
                "inspection",
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
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> Log Maintenance
          </button>
        </div>
      )}

      {/* Table */}
      {(loading || records.length > 0) && (
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
                    "Downtime",
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
                        {Array(8)
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
                      colSpan={8}
                      className="text-center py-12 text-xs text-[var(--text-muted)]"
                    >
                      No records match your search.
                    </td>
                  </tr>
                : filtered.map((r) => {
                    const sc =
                      STATUS_CONFIG[r.status] ?? STATUS_CONFIG.scheduled;
                    const StatusIcon = sc.icon;
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-[var(--bg-elevated)] transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-[var(--text-primary)] max-w-[180px] truncate">
                            {r.equipmentName}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[180px]">
                            {r.description}
                          </p>
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
                          {fmt(r.scheduledDate)}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                          {r.technicianName}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                          {r.downtime ? `${r.downtime}h` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                          {formatCost(r.cost)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {r.status === "scheduled" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(r.id, "in_progress")
                                }
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {r.status === "in_progress" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(r.id, "completed")
                                }
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                            >
                              {deletingId === r.id ? "…" : "Delete"}
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
      )}

      {showModal && profile?.hospitalId && user?.uid && (
        <LogMaintenanceModal
          hospitalId={profile.hospitalId}
          userId={user.uid}
          equipment={equipment}
          onClose={() => setShowModal(false)}
          onSaved={() => load(profile.hospitalId)}
        />
      )}
    </div>
  );
}
