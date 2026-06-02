"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileBarChart2,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getMaintenanceRecords, getEquipment } from "@/lib/firestore";
import { MaintenanceRecord, Equipment } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-3 text-xs shadow-xl">
      <p className="font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Data derivation helpers ──────────────────────────────────────────────────

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildMonthlyKPIs(
  records: MaintenanceRecord[],
  equipment: Equipment[],
) {
  // Last 7 months
  const now = new Date();
  const months: {
    month: string;
    uptime: number;
    mttr: number;
    preventive: number;
    cost: number;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const month = d.getMonth();

    const inMonth = records.filter((r) => {
      const rd = r.scheduledDate;
      return rd.getFullYear() === year && rd.getMonth() === month;
    });

    const completed = inMonth.filter((r) => r.status === "completed");
    const preventive = inMonth.filter(
      (r) => r.type === "preventive" || r.type === "inspection",
    ).length;
    const totalCost = inMonth.reduce((a, r) => a + (r.cost ?? 0), 0);
    const avgDowntime =
      completed.length ?
        completed.reduce((a, r) => a + (r.downtime ?? 0), 0) / completed.length
      : 0;

    // Uptime: (total equipment * 720 hrs/month - total downtime) / (total equipment * 720) * 100
    const totalHours = (equipment.length || 1) * 720;
    const totalDowntime = inMonth.reduce((a, r) => a + (r.downtime ?? 0), 0);
    const uptime = Math.round(
      Math.max(0, ((totalHours - totalDowntime) / totalHours) * 100),
    );

    months.push({
      month: key,
      uptime,
      mttr: Math.round(avgDowntime * 10) / 10,
      preventive,
      cost: Math.round(totalCost / 1000), // in ₦K
    });
  }
  return months;
}

function buildDeptData(records: MaintenanceRecord[], equipment: Equipment[]) {
  const depts = [...new Set(equipment.map((e) => e.department))];
  return depts
    .map((dept) => {
      const deptEquipment = equipment.filter((e) => e.department === dept);
      const deptRecords = records.filter((r) =>
        deptEquipment.some((e) => e.id === r.equipmentId),
      );
      const failures = deptRecords.filter(
        (r) => r.type === "emergency" || r.type === "corrective",
      ).length;
      const totalDowntime = deptRecords.reduce(
        (a, r) => a + (r.downtime ?? 0),
        0,
      );
      const totalHours = (deptEquipment.length || 1) * 720;
      const uptime = Math.round(
        Math.max(0, ((totalHours - totalDowntime) / totalHours) * 100),
      );
      const cost = Math.round(
        deptRecords.reduce((a, r) => a + (r.cost ?? 0), 0) / 1000,
      );
      return { dept, uptime, failures, cost };
    })
    .sort((a, b) => b.failures - a.failures);
}

function buildKPIs(
  records: MaintenanceRecord[],
  prevRecords: MaintenanceRecord[],
) {
  const thisMonth = records.filter((r) => {
    const now = new Date();
    return (
      r.scheduledDate.getMonth() === now.getMonth() &&
      r.scheduledDate.getFullYear() === now.getFullYear()
    );
  });
  const lastMonth = prevRecords.filter((r) => {
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    return (
      r.scheduledDate.getMonth() === prev.getMonth() &&
      r.scheduledDate.getFullYear() === prev.getFullYear()
    );
  });

  function avgMTTR(recs: MaintenanceRecord[]) {
    const done = recs.filter((r) => r.status === "completed" && r.downtime);
    return done.length ?
        done.reduce((a, r) => a + r.downtime, 0) / done.length
      : 0;
  }

  const preventiveThis = thisMonth.filter(
    (r) => r.type === "preventive" || r.type === "inspection",
  ).length;
  const preventivePrev = lastMonth.filter(
    (r) => r.type === "preventive" || r.type === "inspection",
  ).length;
  const correctiveThis = thisMonth.filter(
    (r) => r.type === "corrective" || r.type === "emergency",
  ).length;
  const correctivePrev = lastMonth.filter(
    (r) => r.type === "corrective" || r.type === "emergency",
  ).length;
  const mttrThis = avgMTTR(thisMonth);
  const mttrPrev = avgMTTR(lastMonth);

  // Uptime from all records this month
  const uptimeThis =
    thisMonth.length ?
      Math.round(
        100 -
          (thisMonth.reduce((a, r) => a + r.downtime, 0) /
            (thisMonth.length * 720)) *
            100,
      )
    : 100;
  const uptimePrev =
    lastMonth.length ?
      Math.round(
        100 -
          (lastMonth.reduce((a, r) => a + r.downtime, 0) /
            (lastMonth.length * 720)) *
            100,
      )
    : 100;

  return {
    uptime: {
      value: `${uptimeThis}%`,
      delta: uptimeThis - uptimePrev,
      up: uptimeThis >= uptimePrev,
    },
    mttr: {
      value: `${mttrThis.toFixed(1)}h`,
      delta: mttrThis - mttrPrev,
      up: mttrThis <= mttrPrev,
    },
    preventive: {
      value: preventiveThis,
      delta: preventiveThis - preventivePrev,
      up: preventiveThis >= preventivePrev,
    },
    corrective: {
      value: correctiveThis,
      delta: correctiveThis - correctivePrev,
      up: correctiveThis <= correctivePrev,
    },
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-[var(--bg-elevated)]", className)}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7m");

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
    if (profile === undefined) return;
    if (profile?.hospitalId) load(profile.hospitalId);
    else setLoading(false);
  }, [profile, load]);

  // Derived data
  const monthlyKPIs = buildMonthlyKPIs(records, equipment);
  const deptData = buildDeptData(records, equipment);
  const kpis = buildKPIs(records, records);

  const periodSlice =
    period === "3m" ? 3
    : period === "12m" ? 12
    : 7;
  const chartData = monthlyKPIs.slice(-periodSlice);

  // Group records by month for "generated reports" list
  const reportMonths = [
    ...new Set(
      records.map(
        (r) =>
          `${MONTH_NAMES[r.scheduledDate.getMonth()]} ${r.scheduledDate.getFullYear()}`,
      ),
    ),
  ].slice(0, 5);

  return (
    <div className="space-y-5 fade-in">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ?
          Array(4)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-24" />)
        : [
            {
              icon: CheckCircle2,
              label: "Avg Uptime",
              color: "bg-emerald-500/15 text-emerald-400",
              ...kpis.uptime,
            },
            {
              icon: Clock,
              label: "Avg MTTR",
              color: "bg-blue-500/15 text-blue-400",
              ...kpis.mttr,
            },
            {
              icon: Wrench,
              label: "Preventive Tasks",
              color: "bg-indigo-500/15 text-indigo-400",
              ...kpis.preventive,
            },
            {
              icon: AlertTriangle,
              label: "Corrective Tasks",
              color: "bg-amber-500/15 text-amber-400",
              ...kpis.corrective,
            },
          ].map(({ icon: Icon, label, value, delta, up, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
                >
                  <Icon size={16} />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    up ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {up ?
                    <TrendingDown size={11} />
                  : <TrendingUp size={11} />}
                  {delta > 0 ? "+" : ""}
                  {typeof delta === "number" ? delta.toFixed(1) : delta}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {value}
              </p>
              <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                {label}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                vs last month
              </p>
            </div>
          ))
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Uptime + MTTR */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Uptime & MTTR Trend
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Monthly performance overview
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1">
              {["3m", "7m", "12m"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                    period === p ?
                      "bg-blue-500/20 text-blue-400 border border-blue-500/25"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {loading ?
            <Skeleton className="h-[220px]" />
          : records.length === 0 ?
            <div className="h-[220px] flex items-center justify-center text-xs text-[var(--text-muted)]">
              No data yet
            </div>
          : <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="uptime"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Uptime %"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="mttr"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  name="MTTR (h)"
                />
              </LineChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Failures by dept */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Failures by Department
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-4">
            Corrective &amp; emergency events
          </p>
          {loading ?
            <Skeleton className="h-[220px]" />
          : deptData.length === 0 ?
            <div className="h-[220px] flex items-center justify-center text-xs text-[var(--text-muted)]">
              No data yet
            </div>
          : <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} layout="vertical" barSize={8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="dept"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="failures"
                  fill="#ef4444"
                  radius={[0, 4, 4, 0]}
                  fillOpacity={0.8}
                  name="Failures"
                />
              </BarChart>
            </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Cost + dept table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Maintenance Cost (₦ thousands)
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-4">
            Preventive vs corrective spend
          </p>
          {loading ?
            <Skeleton className="h-[180px]" />
          : records.length === 0 ?
            <div className="h-[180px] flex items-center justify-center text-xs text-[var(--text-muted)]">
              No data yet
            </div>
          : <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="preventive"
                  fill="#6366f1"
                  fillOpacity={0.7}
                  radius={[3, 3, 0, 0]}
                  barSize={12}
                  name="Preventive"
                />
                <Bar
                  dataKey="cost"
                  fill="#ef4444"
                  fillOpacity={0.7}
                  radius={[3, 3, 0, 0]}
                  barSize={12}
                  name="Corrective (₦K)"
                />
              </BarChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Dept performance */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Department Performance
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Uptime ranking
            </p>
          </div>
          {loading ?
            <div className="p-4 space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
            </div>
          : deptData.length === 0 ?
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              No department data yet
            </div>
          : <div className="divide-y divide-[var(--border)]">
              {[...deptData]
                .sort((a, b) => b.uptime - a.uptime)
                .map((d, i) => (
                  <div
                    key={d.dept}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <span className="text-[11px] font-bold text-[var(--text-muted)] w-4">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        {d.dept}
                      </p>
                      <div className="h-1 bg-[var(--bg-elevated)] rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.uptime}%`,
                            background:
                              d.uptime >= 90 ? "#10b981"
                              : d.uptime >= 80 ? "#f59e0b"
                              : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        d.uptime >= 90 ? "text-emerald-400"
                        : d.uptime >= 80 ? "text-amber-400"
                        : "text-red-400",
                      )}
                    >
                      {d.uptime}%
                    </span>
                  </div>
                ))}
            </div>
          }
        </div>
      </div>

      {/* Report archive — derived from real monthly data */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Generated Reports
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Monthly summaries from your data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Filter size={12} /> Filter
            </button>
            <button className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5">
              <FileBarChart2 size={13} /> Generate Report
            </button>
          </div>
        </div>
        {loading ?
          <div className="p-4 space-y-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
          </div>
        : reportMonths.length === 0 ?
          <div className="px-5 py-12 text-center">
            <FileBarChart2
              size={28}
              className="mx-auto text-[var(--text-muted)] mb-3 opacity-40"
            />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              No reports yet
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Reports will appear here once you have maintenance records.
            </p>
          </div>
        : <div className="divide-y divide-[var(--border)]">
            {reportMonths.map((monthLabel) => {
              const monthRecords = records.filter(
                (r) =>
                  `${MONTH_NAMES[r.scheduledDate.getMonth()]} ${r.scheduledDate.getFullYear()}` ===
                  monthLabel,
              );
              const completed = monthRecords.filter(
                (r) => r.status === "completed",
              ).length;
              const totalCost = monthRecords.reduce(
                (a, r) => a + (r.cost ?? 0),
                0,
              );
              return (
                <div
                  key={monthLabel}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                    <FileBarChart2 size={15} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {monthLabel} Equipment Health Report
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar
                        size={10}
                        className="text-[var(--text-muted)]"
                      />
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {monthRecords.length} records · {completed} completed ·
                        ₦{(totalCost / 1000).toFixed(0)}K spent
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-blue">Monthly</span>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all">
                    <Download size={12} /> Download
                  </button>
                  <ChevronRight
                    size={14}
                    className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
                  />
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}
