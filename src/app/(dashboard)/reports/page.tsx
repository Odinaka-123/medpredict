"use client";

import { useState } from "react";
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthlyKPIs = [
  { month: "Nov", uptime: 87, mttr: 5.8, preventive: 12, cost: 420 },
  { month: "Dec", uptime: 83, mttr: 6.2, preventive: 14, cost: 580 },
  { month: "Jan", uptime: 89, mttr: 5.1, preventive: 18, cost: 390 },
  { month: "Feb", uptime: 81, mttr: 6.8, preventive: 16, cost: 610 },
  { month: "Mar", uptime: 91, mttr: 4.6, preventive: 20, cost: 340 },
  { month: "Apr", uptime: 93, mttr: 4.0, preventive: 22, cost: 290 },
  { month: "May", uptime: 94, mttr: 4.2, preventive: 24, cost: 270 },
];

const deptData = [
  { dept: "ICU", uptime: 96, failures: 2, cost: 45 },
  { dept: "Radiology", uptime: 81, failures: 7, cost: 120 },
  { dept: "Theatre", uptime: 92, failures: 3, cost: 67 },
  { dept: "NICU", uptime: 88, failures: 4, cost: 89 },
  { dept: "Obstetrics", uptime: 97, failures: 1, cost: 23 },
  { dept: "Laboratory", uptime: 74, failures: 10, cost: 185 },
  { dept: "Cardiology", uptime: 93, failures: 2, cost: 41 },
];

const RECENT_REPORTS = [
  {
    id: "r-001",
    title: "May 2025 Equipment Health Report",
    date: "May 22, 2025",
    type: "Monthly",
    status: "ready",
    pages: 14,
  },
  {
    id: "r-002",
    title: "Q1 2025 Maintenance Summary",
    date: "Apr 01, 2025",
    type: "Quarterly",
    status: "ready",
    pages: 28,
  },
  {
    id: "r-003",
    title: "ICU Equipment Audit",
    date: "Mar 15, 2025",
    type: "Audit",
    status: "ready",
    pages: 9,
  },
  {
    id: "r-004",
    title: "Laboratory Equipment Risk Assessment",
    date: "Mar 01, 2025",
    type: "Risk",
    status: "ready",
    pages: 11,
  },
  {
    id: "r-005",
    title: "Q4 2024 Maintenance Summary",
    date: "Jan 05, 2025",
    type: "Quarterly",
    status: "ready",
    pages: 31,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const REPORT_TYPE_BADGE: Record<string, string> = {
  Monthly: "badge-blue",
  Quarterly: "badge-info",
  Audit: "badge-warning",
  Risk: "badge-danger",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [period, setPeriod] = useState("7m");

  return (
    <div className="space-y-5 fade-in">
      {/* KPI summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: CheckCircle2,
            label: "Avg Uptime",
            value: "94.1%",
            sub: "+2.3% vs last month",
            trend: false,
            color: "bg-emerald-500/15 text-emerald-400",
          },
          {
            icon: Clock,
            label: "Avg MTTR",
            value: "4.2h",
            sub: "−0.8h vs last month",
            trend: false,
            color: "bg-blue-500/15 text-blue-400",
          },
          {
            icon: Wrench,
            label: "Preventive Tasks",
            value: "24",
            sub: "+2 vs last month",
            trend: false,
            color: "bg-indigo-500/15 text-indigo-400",
          },
          {
            icon: AlertTriangle,
            label: "Corrective Tasks",
            value: "3",
            sub: "−4 vs last month",
            trend: true,
            color: "bg-amber-500/15 text-amber-400",
          },
        ].map(({ icon: Icon, label, value, sub, trend, color }) => (
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
                  trend ? "text-red-400" : "text-emerald-400",
                )}
              >
                {trend ?
                  <TrendingUp size={11} />
                : <TrendingDown size={11} />}
                {sub.split(" ")[0]}
              </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {value}
            </p>
            <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
              {label}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Uptime + MTTR trend */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Uptime & MTTR Trend
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                7-month performance overview
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
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyKPIs}>
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
                domain={[70, 100]}
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
        </div>

        {/* Dept failures bar */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Failures by Department
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-4">
            Year-to-date corrective events
          </p>
          <ResponsiveContainer width="100%" height={220}>
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
        </div>
      </div>

      {/* Cost + dept table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Monthly maintenance cost */}
        <div className="lg:col-span-3 card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Maintenance Cost (₦ thousands)
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-4">
            Corrective vs preventive spend
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyKPIs} barGap={4}>
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
                name="Corrective"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dept performance table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Department Performance
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Uptime ranking
            </p>
          </div>
          <div className="divide-y divide-[var(--border)]">
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
        </div>
      </div>

      {/* Report archive */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Generated Reports
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Download or view past reports
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
        <div className="divide-y divide-[var(--border)]">
          {RECENT_REPORTS.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                <FileBarChart2 size={15} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {r.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar size={10} className="text-[var(--text-muted)]" />
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {r.date} · {r.pages} pages
                  </span>
                </div>
              </div>
              <span className={`badge ${REPORT_TYPE_BADGE[r.type]}`}>
                {r.type}
              </span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all">
                <Download size={12} /> Download
              </button>
              <ChevronRight
                size={14}
                className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
