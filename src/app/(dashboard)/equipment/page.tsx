"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  getEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "@/lib/firestore";
import {
  Equipment,
  EquipmentCategory,
  EquipmentStatus,
  RiskLevel,
} from "@/types";

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  operational: {
    label: "Operational",
    dot: "bg-emerald-400",
    badge: "badge-success",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-blue-400",
    badge: "badge-blue",
  },
  failed: { label: "Failed", dot: "bg-red-400", badge: "badge-danger" },
  decommissioned: {
    label: "Decomm.",
    dot: "bg-slate-400",
    badge: "badge-muted",
  },
};

const CATEGORIES: EquipmentCategory[] = [
  "imaging",
  "laboratory",
  "surgical",
  "monitoring",
  "life_support",
  "other",
];
const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];
const DEPARTMENTS = [
  "Radiology",
  "ICU",
  "Surgery",
  "Theatre",
  "Obstetrics",
  "Cardiology",
  "NICU",
  "Laboratory",
  "Emergency",
  "Orthopaedics",
  "Paediatrics",
  "Other",
];

function riskScore(level: RiskLevel) {
  return (
    level === "critical" ? 90
    : level === "high" ? 65
    : level === "medium" ? 40
    : 15
  );
}

function RiskBar({ level }: { level: RiskLevel }) {
  const score = riskScore(level);
  const color =
    score >= 75 ? "#ef4444"
    : score >= 50 ? "#f59e0b"
    : score >= 25 ? "#eab308"
    : "#10b981";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span
        className="text-xs font-semibold w-16 text-right capitalize"
        style={{ color }}
      >
        {level}
      </span>
    </div>
  );
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(date: Date | null) {
  return date ? date < new Date() : false;
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddEquipmentModal({
  hospitalId,
  onClose,
  onSaved,
}: {
  hospitalId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "monitoring" as EquipmentCategory,
    manufacturer: "",
    model: "",
    serialNumber: "",
    department: "ICU",
    location: "",
    status: "operational" as EquipmentStatus,
    riskLevel: "low" as RiskLevel,
    usageHours: 0,
    notes: "",
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addEquipment({
        ...form,
        hospitalId,
        failureCount: 0,
        installDate: new Date(),
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
      });
      onSaved();
      onClose();
    } catch {
      setError("Failed to save equipment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "w-full px-3 py-2.5 text-sm bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition";
  const lbl =
    "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-base)]"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Add Equipment
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Register a new device to the system
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={lbl}>Equipment Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Siemens ACUSON X700 Ultrasound"
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Category *</label>
              <select
                value={form.category}
                onChange={(e) =>
                  set("category", e.target.value as EquipmentCategory)
                }
                className={inp}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Department *</label>
              <select
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className={inp}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Manufacturer</label>
              <input
                value={form.manufacturer}
                onChange={(e) => set("manufacturer", e.target.value)}
                placeholder="e.g. Siemens"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Model</label>
              <input
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="e.g. ACUSON X700"
                className={inp}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Serial Number</label>
              <input
                value={form.serialNumber}
                onChange={(e) => set("serialNumber", e.target.value)}
                placeholder="e.g. SN-2024-001"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Location</label>
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Room 101"
                className={inp}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Status *</label>
              <select
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as EquipmentStatus)
                }
                className={inp}
              >
                {(
                  [
                    "operational",
                    "maintenance",
                    "failed",
                    "decommissioned",
                  ] as EquipmentStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Risk Level *</label>
              <select
                value={form.riskLevel}
                onChange={(e) => set("riskLevel", e.target.value as RiskLevel)}
                className={inp}
              >
                {RISK_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Usage Hours</label>
            <input
              type="number"
              min={0}
              value={form.usageHours}
              onChange={(e) => set("usageHours", Number(e.target.value))}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Any additional notes…"
              className={`${inp} resize-none`}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-2"
            >
              {saving && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {saving ? "Saving…" : "Add Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  equipment,
  onClose,
  onDeleted,
}: {
  equipment: Equipment;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEquipment(equipment.id);
      onDeleted();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-base)] p-6"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
          Delete Equipment
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="text-[var(--text-primary)] font-medium">
            {equipment.name}
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-2"
          >
            {deleting && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EquipmentPage() {
  const { profile } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = useCallback(async (hospitalId: string) => {
    setLoading(true);
    try {
      const data = await getEquipment(hospitalId);
      setEquipment(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to resolve — profile is undefined while loading
    if (profile === undefined) return;
    if (profile?.hospitalId) {
      load(profile.hospitalId);
    } else {
      setLoading(false); // Auth resolved, no hospitalId → show empty state
    }
  }, [profile, load]);

  const filtered = equipment.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.manufacturer.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === "all" || e.status === statusFilter);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleStatusChange(id: string, status: EquipmentStatus) {
    await updateEquipment(id, { status });
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e)),
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm"
              placeholder="Search equipment or department…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1 flex-wrap">
            {[
              "all",
              "operational",
              "maintenance",
              "failed",
              "decommissioned",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize",
                  statusFilter === s ?
                    "bg-blue-500/20 text-blue-400 border border-blue-500/25"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                )}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => profile?.hospitalId && load(profile.hospitalId)}
            className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> Add Equipment
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                {[
                  "Equipment",
                  "Department",
                  "Status",
                  "Risk Level",
                  "Usage (hrs)",
                  "Last Maintenance",
                  "Next Due",
                  "",
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
              : paginated.length === 0 ?
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[var(--text-muted)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {search || statusFilter !== "all" ?
                          "No equipment matches your filters."
                        : "No equipment added yet."}
                      </p>
                      {!search && statusFilter === "all" && (
                        <p className="text-xs text-[var(--text-muted)] max-w-xs">
                          Click &ldquo;Add Equipment&rdquo; to register your
                          first device.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              : paginated.map((eq) => {
                  const sc =
                    STATUS_CONFIG[eq.status] ?? STATUS_CONFIG.operational;
                  const overdue = isOverdue(eq.nextMaintenanceDate);
                  return (
                    <tr
                      key={eq.id}
                      className="hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text-primary)] text-xs">
                          {eq.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] capitalize">
                          {eq.category.replace("_", " ")} · {eq.failureCount}{" "}
                          failure{eq.failureCount !== 1 ? "s" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {eq.department}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          <span className={`badge ${sc.badge}`}>
                            {sc.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-36">
                        <RiskBar level={eq.riskLevel} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {eq.usageHours.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {formatDate(eq.lastMaintenanceDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            overdue ? "text-red-400" : (
                              "text-[var(--text-secondary)]"
                            ),
                          )}
                        >
                          {overdue ?
                            "Overdue"
                          : formatDate(eq.nextMaintenanceDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            value={eq.status}
                            onChange={(e) =>
                              handleStatusChange(
                                eq.id,
                                e.target.value as EquipmentStatus,
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-1.5 py-1 text-[var(--text-secondary)] capitalize cursor-pointer"
                          >
                            {(
                              [
                                "operational",
                                "maintenance",
                                "failed",
                                "decommissioned",
                              ] as EquipmentStatus[]
                            ).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(eq);
                            }}
                            className="w-7 h-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                          <ChevronRight
                            size={14}
                            className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            {loading ?
              "Loading…"
            : `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length || 1)}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} devices`
            }
          </p>
          {totalPages > 1 && (
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-7 h-7 rounded text-xs font-medium transition-all",
                    p === page ?
                      "bg-blue-500/20 text-blue-400"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && profile?.hospitalId && (
        <AddEquipmentModal
          hospitalId={profile.hospitalId}
          onClose={() => setShowAddModal(false)}
          onSaved={() => load(profile.hospitalId)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          equipment={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => load(profile!.hospitalId)}
        />
      )}
    </div>
  );
}
