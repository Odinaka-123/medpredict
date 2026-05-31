"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getDashboardStats,
  getHighRiskEquipment,
  getUpcomingMaintenance,
  getMonthlyMaintenanceData,
  seedDemoData,
  hasSeededData,
} from "@/lib/firestore";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Zap,
  Database,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardStats, Equipment, MaintenanceRecord } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyData {
  month: string;
  failures: number;
  preventive: number;
  corrective: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  trend?: { value: string; up: boolean };
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="card p-5 hover:border-[var(--border-strong)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon size={18} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium flex items-center gap-0.5 ${trend.up ? "text-red-400" : "text-emerald-400"}`}
          >
            {trend.up ?
              <TrendingUp size={12} />
            : <TrendingDown size={12} />}
            {trend.value}
          </span>
        )}
      </div>
      {loading ?
        <div className="h-8 w-16 bg-[var(--bg-elevated)] rounded animate-pulse mb-1" />
      : <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      }
      <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
        {label}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
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

const riskColor = (risk: string) =>
  risk === "critical" ? "text-red-400"
  : risk === "high" ? "text-amber-400"
  : risk === "medium" ? "text-yellow-400"
  : "text-emerald-400";

const riskBg = (risk: string) =>
  risk === "critical" ? "bg-red-500/15 text-red-400"
  : risk === "high" ? "bg-amber-500/15 text-amber-400"
  : "bg-yellow-500/15 text-yellow-400";

const statusColors = {
  operational: "#10b981",
  maintenance: "#6366f1",
  failed: "#ef4444",
  decommissioned: "#64748b",
};

const monthNames = [
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

function formatDate(date: Date): string {
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const { profile, user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [highRisk, setHighRisk] = useState<Equipment[]>([]);
  const [upcoming, setUpcoming] = useState<MaintenanceRecord[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [hasData, setHasData] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.hospitalId) return;
    setLoading(true);
    try {
      const [s, hr, up, mo, seeded] = await Promise.all([
        getDashboardStats(profile.hospitalId),
        getHighRiskEquipment(profile.hospitalId),
        getUpcomingMaintenance(profile.hospitalId),
        getMonthlyMaintenanceData(profile.hospitalId),
        hasSeededData(profile.hospitalId),
      ]);
      setStats(s);
      setHighRisk(hr);
      setUpcoming(up);
      setMonthly(mo);
      setHasData(seeded);
    } finally {
      setLoading(false);
    }
  }, [profile?.hospitalId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSeedData() {
    if (!profile?.hospitalId || !user?.uid) return;
    setSeeding(true);
    try {
      await seedDemoData(profile.hospitalId, user.uid);
      await load();
    } finally {
      setSeeding(false);
    }
  }

  // Build pie data from stats
  const statusData =
    stats ?
      [
        {
          name: "Operational",
          value: stats.operational,
          color: statusColors.operational,
        },
        {
          name: "Maintenance",
          value: stats.underMaintenance,
          color: statusColors.maintenance,
        },
        { name: "Failed", value: stats.failed, color: statusColors.failed },
        {
          name: "Decommissioned",
          value:
            stats.totalEquipment -
            stats.operational -
            stats.underMaintenance -
            stats.failed,
          color: statusColors.decommissioned,
        },
      ].filter((d) => d.value > 0)
    : [];

  const atRisk =
    stats ?
      stats.criticalRisk + highRisk.filter((e) => e.riskLevel === "high").length
    : 0;

  // ── Empty state ──
  if (!loading && !hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Database size={28} className="text-blue-400" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            No equipment data yet
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Load demo data to see how MedPredict works with real Nigerian
            hospital equipment records, or add your own equipment.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {seeding ?
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
            : <Database size={15} />}
            {seeding ? "Loading demo data…" : "Load demo data"}
          </button>
          <a
            href="/equipment"
            className="flex items-center gap-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Add equipment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Equipment"
          value={stats ? String(stats.totalEquipment) : "—"}
          sub="Across all departments"
          color="bg-blue-500/15 text-blue-400"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Operational"
          value={stats ? String(stats.operational) : "—"}
          sub={
            stats ?
              `${Math.round((stats.operational / stats.totalEquipment) * 100)}% availability`
            : "—"
          }
          color="bg-emerald-500/15 text-emerald-400"
          loading={loading}
        />
        <StatCard
          icon={AlertTriangle}
          label="At-Risk Devices"
          value={stats ? String(atRisk) : "—"}
          sub="Needs attention soon"
          color="bg-amber-500/15 text-amber-400"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Avg Downtime (MTTR)"
          value={stats ? `${stats.avgDowntime}h` : "—"}
          sub="Mean time to repair"
          color="bg-indigo-500/15 text-indigo-400"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Failure trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Maintenance Activity
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Last 6 months — failures vs maintenance
              </p>
            </div>
            <span className="badge badge-blue">Live</span>
          </div>
          {loading ?
            <div className="h-[220px] bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
          : monthly.length === 0 ?
            <div className="h-[220px] flex items-center justify-center text-sm text-[var(--text-muted)]">
              No maintenance records yet
            </div>
          : <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="failures"
                  stroke="#ef4444"
                  fill="url(#gFail)"
                  strokeWidth={2}
                  name="Failures"
                />
                <Area
                  type="monotone"
                  dataKey="preventive"
                  stroke="#10b981"
                  fill="url(#gPrev)"
                  strokeWidth={2}
                  name="Preventive"
                />
              </AreaChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Status pie */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Equipment Status
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Current operational state
          </p>
          {loading ?
            <div className="h-[160px] bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-4" />
          : <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          }
          <div className="space-y-1.5 mt-2">
            {loading ?
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse"
                  />
                ))
            : statusData.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-[var(--text-secondary)]">
                      {s.name}
                    </span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {s.value}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High risk alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              High Risk Alerts
            </h2>
            <a
              href="/predictions"
              className="text-xs text-blue-400 hover:underline"
            >
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {loading ?
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-[var(--bg-elevated)] rounded-lg animate-pulse"
                  />
                ))
            : highRisk.length === 0 ?
              <p className="text-sm text-[var(--text-muted)] text-center py-6">
                No high risk equipment
              </p>
            : highRisk.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/equipment`)}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${riskBg(e.riskLevel)}`}
                  >
                    <Zap size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {e.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {e.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${riskColor(e.riskLevel)}`}
                    >
                      {e.riskLevel.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {e.failureCount} failures
                    </p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Upcoming maintenance */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Upcoming Maintenance
            </h2>
            <a
              href="/maintenance"
              className="text-xs text-blue-400 hover:underline"
            >
              Schedule →
            </a>
          </div>
          <div className="space-y-2">
            {loading ?
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-[var(--bg-elevated)] rounded-lg animate-pulse"
                  />
                ))
            : upcoming.length === 0 ?
              <p className="text-sm text-[var(--text-muted)] text-center py-6">
                No upcoming maintenance
              </p>
            : upcoming.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-[10px] font-bold text-blue-400 leading-none">
                      {monthNames[m.scheduledDate.getMonth()].toUpperCase()}
                    </p>
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-none">
                      {m.scheduledDate.getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {m.equipmentName}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {formatDate(m.scheduledDate)}
                    </p>
                  </div>
                  <span className="badge badge-info text-[10px] capitalize">
                    {m.type}
                  </span>
                </div>
              ))
            }
          </div>

          {/* Cost summary */}
          {!loading && stats && stats.totalMaintenanceCost > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Total maintenance cost
              </span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatCurrency(stats.totalMaintenanceCost)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
