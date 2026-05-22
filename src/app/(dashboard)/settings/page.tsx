"use client";

import { useState, useEffect } from "react";
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
  Loader2,
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

// ─── Component Types ──────────────────────────────────────────────────────────

interface KPIItem {
  month: string;
  uptime: number;
  mttr: number;
  preventive: number;
  cost: number;
}

interface DeptItem {
  dept: string;
  uptime: number;
  failures: number;
  cost: number;
}

interface SummaryCard {
  label: string;
  value: string;
  sub: string;
  isNegativeTrend: boolean;
  color: string;
  type: "uptime" | "mttr" | "preventive" | "corrective";
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

// Map key types securely to lucide component instances
const ICON_MAP = {
  uptime: CheckCircle2,
  mttr: Clock,
  preventive: Wrench,
  corrective: AlertTriangle,
};

const RECENT_REPORTS = [
  {
    id: "r-001",
    title: "May 2026 Equipment Health Report",
    date: "May 22, 2026",
    type: "Monthly",
    pages: 14,
  },
  {
    id: "r-002",
    title: "Q1 2026 Maintenance Summary",
    date: "Apr 01, 2026",
    type: "Quarterly",
    pages: 28,
  },
  {
    id: "r-003",
    title: "ICU Equipment Audit",
    date: "Mar 15, 2026",
    type: "Audit",
    pages: 9,
  },
  {
    id: "r-004",
    title: "Laboratory Equipment Risk Assessment",
    date: "Mar 01, 2026",
    type: "Risk",
    pages: 11,
  },
];

// ─── Presentation Tooltip ─────────────────────────────────────────────────────

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
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs shadow-xl text-white">
      <p className="font-medium mb-1 text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="py-0.5">
          {p.name}: <strong className="text-white">{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const REPORT_TYPE_BADGE: Record<string, string> = {
  Monthly: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Quarterly: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Audit: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Risk: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function ReportsPage() {
  const [period, setPeriod] = useState("7m");
  const [monthlyKPIs, setMonthlyKPIs] = useState<KPIItem[]>([]);
  const [deptData, setDeptData] = useState<DeptItem[]>([]);
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/reports/stats?period=${period}`);
        if (!response.ok) throw new Error("Failed to capture updated metrics.");

        const data = await response.json();
        setMonthlyKPIs(data.monthlyKPIs);
        setDeptData(data.deptData);
        setSummaryCards(data.summaryCards);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [period]);

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
        <AlertTriangle className="mx-auto mb-2" size={24} />
        <p className="font-semibold">Error Loading Performance Metrics</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ?
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800 animate-pulse rounded-xl h-32"
            />
          ))
        : summaryCards.map(
            ({ label, value, sub, isNegativeTrend, color, type }) => {
              const Icon = ICON_MAP[type] || CheckCircle2;
              return (
                <div
                  key={label}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        color,
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium flex items-center gap-0.5",
                        isNegativeTrend ? "text-red-400" : "text-emerald-400",
                      )}
                    >
                      {isNegativeTrend ?
                        <TrendingUp size={11} />
                      : <TrendingDown size={11} />}
                      {sub.split(" ")[0]}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
                </div>
              );
            },
          )
        }
      </div>

      {/* Main Analysis Engine Visuals */}
      {isLoading ?
        <div className="flex items-center justify-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-xl">
          <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />
          <span className="text-sm text-slate-400">
            Refreshing analysis visual systems...
          </span>
        </div>
      : <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Uptime + MTTR trend */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Uptime & MTTR Trend
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {period.toUpperCase()} performance overview
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                  {["3m", "7m", "12m"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                        period === p ?
                          "bg-blue-500/20 text-blue-400 border border-blue-500/25"
                        : "text-slate-400 hover:text-white",
                      )}
                    >
                      {p.toUpperCase()}
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
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">
                Failures by Department
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                Historical dynamic events
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
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-1">
                Maintenance Cost (₦ thousands)
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                Corrective vs preventive spend distribution
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
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-white">
                  Department Performance
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Uptime ranking metrics
                </p>
              </div>
              <div className="divide-y divide-slate-800">
                {[...deptData]
                  .sort((a, b) => b.uptime - a.uptime)
                  .map((d, i) => (
                    <div
                      key={d.dept}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-850 transition-colors"
                    >
                      <span className="text-[11px] font-bold text-slate-500 w-4">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">
                          {d.dept}
                        </p>
                        <div className="h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.uptime}%`,
                              backgroundColor:
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
        </>
      }

      {/* Static Report Archive View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Generated Reports
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Download or view past reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors">
              <Filter size={12} /> Filter
            </button>
            <button className="bg-blue-600 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-500 transition-colors">
              <FileBarChart2 size={13} /> Generate Report
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-800">
          {RECENT_REPORTS.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-950/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0">
                <FileBarChart2 size={15} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {r.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar size={10} className="text-slate-500" />
                  <span className="text-[11px] text-slate-500">
                    {r.date} · {r.pages} pages
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide",
                  REPORT_TYPE_BADGE[r.type],
                )}
              >
                {r.type}
              </span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                <Download size={12} /> Download
              </button>
              <ChevronRight
                size={14}
                className="text-slate-500 group-hover:text-white transition-colors"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
