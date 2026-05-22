"use client";

import { useState } from "react";
import { Plus, Search, Calendar, CheckCircle, Clock, XCircle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const RECORDS = [
  { id: "m001", equipment: "Siemens ACUSON X700 Ultrasound", dept: "Radiology",  type: "corrective",  status: "completed",   date: "May 10, 2025", tech: "Emeka Okonkwo",  duration: 6.5,  cost: 280000, findings: "Transducer probe replaced, software recalibrated" },
  { id: "m002", equipment: "GE Carescape B650 Monitor",      dept: "ICU",        type: "preventive",  status: "in_progress", date: "May 20, 2025", tech: "Fatima Bello",   duration: null, cost: 45000,  findings: "Routine PM ongoing" },
  { id: "m003", equipment: "Drager Babylog VN500",           dept: "NICU",       type: "emergency",   status: "completed",   date: "May 15, 2025", tech: "Chukwudi Eze",  duration: 3.0,  cost: 620000, findings: "Flow sensor replaced, alarm system tested" },
  { id: "m004", equipment: "Philips IntelliVue MX550",       dept: "Surgery",    type: "calibration", status: "scheduled",   date: "May 26, 2025", tech: "Aisha Musa",    duration: null, cost: null,   findings: null },
  { id: "m005", equipment: "Roche Cobas 6000 Analyzer",      dept: "Laboratory", type: "preventive",  status: "completed",   date: "May 08, 2025", tech: "Emeka Okonkwo", duration: 4.0,  cost: 95000,  findings: "Pipette serviced, reagent lines cleaned" },
  { id: "m006", equipment: "Mindray BS-480 Auto Analyzer",   dept: "Laboratory", type: "corrective",  status: "in_progress", date: "May 21, 2025", tech: "Chukwudi Eze",  duration: null, cost: null,   findings: "Motor assembly failure — parts on order" },
  { id: "m007", equipment: "GE Voluson E10 Ultrasound",      dept: "Obstetrics", type: "preventive",  status: "scheduled",   date: "May 24, 2025", tech: "Fatima Bello",  duration: null, cost: null,   findings: null },
];

const TYPE_BADGE: Record<string, string> = {
  preventive: "badge-success", corrective: "badge-warning",
  emergency: "badge-danger", calibration: "badge-blue", inspection: "badge-info",
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  completed:   { label: "Completed",   icon: CheckCircle, cls: "text-emerald-400" },
  in_progress: { label: "In Progress", icon: Clock,       cls: "text-blue-400" },
  scheduled:   { label: "Scheduled",   icon: Calendar,    cls: "text-amber-400" },
  cancelled:   { label: "Cancelled",   icon: XCircle,     cls: "text-slate-400" },
};

const STATS = [
  { label: "Total Records",    value: "127",   icon: Wrench,       color: "bg-blue-500/15 text-blue-400" },
  { label: "Completed",        value: "94",    icon: CheckCircle,  color: "bg-emerald-500/15 text-emerald-400" },
  { label: "In Progress",      value: "8",     icon: Clock,        color: "bg-indigo-500/15 text-indigo-400" },
  { label: "Upcoming (7 days)", value: "11",   icon: Calendar,     color: "bg-amber-500/15 text-amber-400" },
];

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = RECORDS.filter((r) => {
    const ms = r.equipment.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === "all" || r.type === typeFilter;
    return ms && mt;
  });

  return (
    <div className="space-y-5 fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input className="pl-9 pr-3 py-2 text-sm w-60" placeholder="Search records…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1">
            {["all", "preventive", "corrective", "emergency", "calibration"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                  typeFilter === t ? "bg-blue-500/20 text-blue-400 border border-blue-500/25" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
              >{t === "all" ? "All" : t}</button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Log Maintenance
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                {["Equipment", "Type", "Status", "Date", "Technician", "Duration", "Cost (₦)", "Findings"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((r) => {
                const sc = STATUS_CONFIG[r.status];
                return (
                  <tr key={r.id} className="hover:bg-[var(--bg-elevated)] transition-colors group cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-[var(--text-primary)] max-w-[180px] truncate">{r.equipment}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{r.dept}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${TYPE_BADGE[r.type]} capitalize`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${sc.cls}`}>
                        <sc.icon size={13} />
                        {sc.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{r.tech}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{r.duration ? `${r.duration}h` : "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{r.cost ? r.cost.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] max-w-[200px] truncate">{r.findings ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Showing {filtered.length} of {RECORDS.length} records</p>
        </div>
      </div>

      {/* Simple modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">Log Maintenance Record</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Equipment</label>
                <select className="w-full px-3 py-2 text-sm">
                  {RECORDS.map(r => <option key={r.id}>{r.equipment}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">Type</label>
                  <select className="w-full px-3 py-2 text-sm">
                    {["preventive", "corrective", "emergency", "calibration", "inspection"].map(t => <option key={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">Date</label>
                  <input type="date" className="w-full px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Technician</label>
                <input className="w-full px-3 py-2 text-sm" placeholder="Technician name" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Findings / Notes</label>
                <textarea className="w-full px-3 py-2 text-sm h-20 resize-none" placeholder="Describe what was found and done…" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
                <button className="btn-primary text-sm" onClick={() => setShowForm(false)}>Save Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}