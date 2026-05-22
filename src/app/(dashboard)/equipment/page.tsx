"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EQUIPMENT_LIST = [
  {
    id: "eq-001",
    name: "Siemens ACUSON X700 Ultrasound",
    dept: "Radiology",
    status: "critical",
    risk: 82,
    hours: 8200,
    failures: 5,
    lastMaint: "Jan 10, 2025",
    nextMaint: "Jul 10, 2025",
    category: "Imaging",
  },
  {
    id: "eq-002",
    name: "GE Carescape B650 Monitor",
    dept: "ICU",
    status: "warning",
    risk: 67,
    hours: 14600,
    failures: 3,
    lastMaint: "Nov 20, 2024",
    nextMaint: "May 20, 2025",
    category: "Monitoring",
  },
  {
    id: "eq-003",
    name: "Philips IntelliVue MX550",
    dept: "Surgery",
    status: "warning",
    risk: 71,
    hours: 12000,
    failures: 4,
    lastMaint: "Dec 05, 2024",
    nextMaint: "Jun 05, 2025",
    category: "Monitoring",
  },
  {
    id: "eq-004",
    name: "Drager Primus Anaesthesia",
    dept: "Theatre",
    status: "warning",
    risk: 58,
    hours: 6800,
    failures: 2,
    lastMaint: "Feb 14, 2025",
    nextMaint: "Aug 14, 2025",
    category: "Life Support",
  },
  {
    id: "eq-005",
    name: "GE Voluson E10 Ultrasound",
    dept: "Obstetrics",
    status: "operational",
    risk: 22,
    hours: 5400,
    failures: 1,
    lastMaint: "Apr 01, 2025",
    nextMaint: "Oct 01, 2025",
    category: "Imaging",
  },
  {
    id: "eq-006",
    name: "Mindray DC-70 Ultrasound",
    dept: "Cardiology",
    status: "operational",
    risk: 31,
    hours: 7200,
    failures: 2,
    lastMaint: "Mar 15, 2025",
    nextMaint: "Sep 15, 2025",
    category: "Imaging",
  },
  {
    id: "eq-007",
    name: "Drager Babylog VN500",
    dept: "NICU",
    status: "maintenance",
    risk: 44,
    hours: 9100,
    failures: 3,
    lastMaint: "May 01, 2025",
    nextMaint: "Jun 02, 2025",
    category: "Life Support",
  },
  {
    id: "eq-008",
    name: "Philips Efficia CM10 Monitor",
    dept: "ICU",
    status: "operational",
    risk: 18,
    hours: 3200,
    failures: 0,
    lastMaint: "Apr 20, 2025",
    nextMaint: "May 28, 2025",
    category: "Monitoring",
  },
  {
    id: "eq-009",
    name: "Roche Cobas 6000 Analyzer",
    dept: "Laboratory",
    status: "operational",
    risk: 27,
    hours: 11000,
    failures: 2,
    lastMaint: "Mar 30, 2025",
    nextMaint: "Sep 30, 2025",
    category: "Laboratory",
  },
  {
    id: "eq-010",
    name: "Mindray BS-480 Auto Analyzer",
    dept: "Laboratory",
    status: "offline",
    risk: 91,
    hours: 15200,
    failures: 8,
    lastMaint: "Oct 10, 2024",
    nextMaint: "Overdue",
    category: "Laboratory",
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  operational: {
    label: "Operational",
    dot: "bg-emerald-400",
    badge: "badge-success",
  },
  warning: { label: "Warning", dot: "bg-amber-400", badge: "badge-warning" },
  critical: { label: "Critical", dot: "bg-red-400", badge: "badge-danger" },
  maintenance: {
    label: "Maintenance",
    dot: "bg-blue-400",
    badge: "badge-blue",
  },
  offline: { label: "Offline", dot: "bg-slate-400", badge: "badge-muted" },
};

function RiskBar({ score }: { score: number }) {
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
      <span className="text-xs font-semibold w-7 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = EQUIPMENT_LIST.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm"
              placeholder="Search equipment or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1">
            {[
              "all",
              "critical",
              "warning",
              "operational",
              "maintenance",
              "offline",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
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
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add Equipment
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
                  "Department",
                  "Status",
                  "Risk Score",
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
              {filtered.map((eq) => {
                const sc = STATUS_CONFIG[eq.status];
                return (
                  <tr
                    key={eq.id}
                    className="hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[var(--text-primary)] text-xs">
                          {eq.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {eq.category} · {eq.failures} failure
                          {eq.failures !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {eq.dept}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <span className={`badge ${sc.badge}`}>{sc.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 w-32">
                      <RiskBar score={eq.risk} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {eq.hours.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {eq.lastMaint}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          eq.nextMaint === "Overdue" ?
                            "text-red-400"
                          : "text-[var(--text-secondary)]",
                        )}
                      >
                        {eq.nextMaint}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight
                        size={14}
                        className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {filtered.length} of {EQUIPMENT_LIST.length} devices
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={cn(
                  "w-7 h-7 rounded text-xs font-medium transition-all",
                  p === 1 ?
                    "bg-blue-500/20 text-blue-400"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
