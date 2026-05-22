"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Zap,
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthlyData = [
  { month: "Nov", failures: 8, preventive: 12, corrective: 6 },
  { month: "Dec", failures: 11, preventive: 14, corrective: 9 },
  { month: "Jan", failures: 7, preventive: 18, corrective: 5 },
  { month: "Feb", failures: 14, preventive: 16, corrective: 11 },
  { month: "Mar", failures: 9, preventive: 20, corrective: 7 },
  { month: "Apr", failures: 6, preventive: 22, corrective: 4 },
  { month: "May", failures: 5, preventive: 24, corrective: 3 },
];

const statusData = [
  { name: "Operational", value: 38, color: "#10b981" },
  { name: "Warning", value: 12, color: "#f59e0b" },
  { name: "Critical", value: 5, color: "#ef4444" },
  { name: "Maintenance", value: 7, color: "#6366f1" },
  { name: "Offline", value: 3, color: "#64748b" },
];

const recentAlerts = [
  {
    id: 1,
    equipment: "Siemens ACUSON X700 Ultrasound",
    dept: "Radiology",
    risk: 82,
    status: "critical",
  },
  {
    id: 2,
    equipment: "GE Carescape B650 Monitor",
    dept: "ICU",
    risk: 67,
    status: "warning",
  },
  {
    id: 3,
    equipment: "Philips IntelliVue MX550",
    dept: "Surgery",
    risk: 71,
    status: "warning",
  },
  {
    id: 4,
    equipment: "Drager Primus Anaesthesia",
    dept: "Theatre",
    risk: 58,
    status: "warning",
  },
];

const upcomingMaintenance = [
  {
    id: 1,
    name: "GE Voluson E10 Ultrasound",
    date: "May 24",
    type: "Preventive",
    dept: "Obstetrics",
  },
  {
    id: 2,
    name: "Mindray DC-70 Ultrasound",
    date: "May 26",
    type: "Calibration",
    dept: "Cardiology",
  },
  {
    id: 3,
    name: "Philips Efficia CM10 Monitor",
    date: "May 28",
    type: "Preventive",
    dept: "ICU",
  },
  {
    id: 4,
    name: "Drager Babylog VN500",
    date: "Jun 02",
    type: "Inspection",
    dept: "NICU",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  trend?: { value: string; up: boolean };
  color: string;
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
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
        {label}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>
    </div>
  );
}

interface TooltipPayloadItem {
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
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-3 text-xs shadow-xl">
      <p className="font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((p: TooltipPayloadItem) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  return (
    <div className="space-y-6 fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Equipment"
          value="65"
          sub="Across all departments"
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Operational"
          value="38"
          sub="58% availability rate"
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="At-Risk Devices"
          value="17"
          sub="Needs attention soon"
          color="bg-amber-500/15 text-amber-400"
          trend={{ value: "+3 this week", up: true }}
        />
        <StatCard
          icon={Clock}
          label="Avg Downtime (MTTR)"
          value="4.2h"
          sub="Mean time to repair"
          color="bg-indigo-500/15 text-indigo-400"
          trend={{ value: "-0.8h vs last month", up: false }}
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
                Last 7 months — failures vs maintenance
              </p>
            </div>
            <span className="badge badge-blue">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
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
        </div>

        {/* Status pie */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Equipment Status
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Current operational state
          </p>
          <ResponsiveContainer width="100%" height={160}>
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
          <div className="space-y-1.5 mt-2">
            {statusData.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-[var(--text-secondary)]">{s.name}</span>
                </div>
                <span className="font-semibold text-[var(--text-primary)]">
                  {s.value}
                </span>
              </div>
            ))}
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
            {recentAlerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <div
                  className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.status === "critical" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}
                >
                  <Zap size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                    {a.equipment}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {a.dept}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${a.risk >= 75 ? "text-red-400" : "text-amber-400"}`}
                  >
                    {a.risk}%
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">risk</p>
                </div>
              </div>
            ))}
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
            {upcomingMaintenance.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col items-center justify-center flex-shrink-0">
                  <p className="text-[10px] font-bold text-blue-400 leading-none">
                    {m.date.split(" ")[0].toUpperCase()}
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] leading-none">
                    {m.date.split(" ")[1]}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {m.dept}
                  </p>
                </div>
                <span className="badge badge-info text-[10px]">{m.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
