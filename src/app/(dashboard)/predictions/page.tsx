"use client";

import { useState } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Zap,
  ShieldAlert,
  Activity,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PREDICTIONS = [
  {
    id: "p-001",
    equipment: "Mindray BS-480 Auto Analyzer",
    dept: "Laboratory",
    riskScore: 91,
    confidence: 94,
    failureType: "Motor failure",
    estimatedDays: 3,
    trend: "worsening",
    factors: [
      "High usage hours (15,200h)",
      "8 prior failures",
      "Overdue maintenance",
    ],
  },
  {
    id: "p-002",
    equipment: "Siemens ACUSON X700 Ultrasound",
    dept: "Radiology",
    riskScore: 82,
    confidence: 88,
    failureType: "Transducer degradation",
    estimatedDays: 7,
    trend: "worsening",
    factors: [
      "Probe wear detected",
      "5 failures in 12 months",
      "Operating above rated hours",
    ],
  },
  {
    id: "p-003",
    equipment: "Philips IntelliVue MX550",
    dept: "Surgery",
    riskScore: 71,
    confidence: 79,
    failureType: "Display module fault",
    estimatedDays: 14,
    trend: "stable",
    factors: [
      "Screen flicker logs",
      "Sensor calibration drift",
      "High ambient temperature",
    ],
  },
  {
    id: "p-004",
    equipment: "GE Carescape B650 Monitor",
    dept: "ICU",
    riskScore: 67,
    confidence: 83,
    failureType: "Battery cell degradation",
    estimatedDays: 21,
    trend: "stable",
    factors: [
      "Battery capacity at 61%",
      "3 unexpected shutdowns",
      "Charging anomalies",
    ],
  },
  {
    id: "p-005",
    equipment: "Drager Primus Anaesthesia",
    dept: "Theatre",
    riskScore: 58,
    confidence: 72,
    failureType: "Gas valve leak",
    estimatedDays: 30,
    trend: "improving",
    factors: [
      "Minor seal wear",
      "Pressure variance detected",
      "Recent partial service",
    ],
  },
  {
    id: "p-006",
    equipment: "Drager Babylog VN500",
    dept: "NICU",
    riskScore: 44,
    confidence: 68,
    failureType: "Flow sensor drift",
    estimatedDays: 45,
    trend: "stable",
    factors: ["Sensor calibration needed", "3 failures in 18 months"],
  },
];

const riskTrendData = [
  { day: "May 16", mindray: 76, siemens: 68, philips: 60 },
  { day: "May 17", mindray: 80, siemens: 71, philips: 63 },
  { day: "May 18", mindray: 84, siemens: 74, philips: 66 },
  { day: "May 19", mindray: 87, siemens: 76, philips: 68 },
  { day: "May 20", mindray: 89, siemens: 79, philips: 70 },
  { day: "May 21", mindray: 90, siemens: 81, philips: 71 },
  { day: "May 22", mindray: 91, siemens: 82, philips: 71 },
];

const radarData = [
  { factor: "Usage Hours", score: 92 },
  { factor: "Failure Rate", score: 85 },
  { factor: "Age", score: 70 },
  { factor: "Maintenance", score: 95 },
  { factor: "Environment", score: 60 },
  { factor: "Sensor Health", score: 78 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRiskColor(score: number) {
  if (score >= 75)
    return {
      text: "text-red-400",
      bg: "bg-red-500/15",
      border: "border-red-500/25",
    };
  if (score >= 50)
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-500/25",
    };
  return {
    text: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/25",
  };
}

function RiskGauge({ score }: { score: number }) {
  const c = getRiskColor(score);
  const color =
    score >= 75 ? "#ef4444"
    : score >= 50 ? "#f59e0b"
    : "#10b981";
  const pct = score / 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${c.text}`}>{score}</span>
      </div>
    </div>
  );
}

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
          {p.name}: <strong>{p.value}%</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PredictionsPage() {
  const [selected, setSelected] = useState(PREDICTIONS[0]);
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");

  const filtered = PREDICTIONS.filter((p) => {
    if (filter === "critical") return p.riskScore >= 75;
    if (filter === "warning") return p.riskScore >= 50 && p.riskScore < 75;
    return true;
  });

  return (
    <div className="space-y-5 fade-in">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: ShieldAlert,
            label: "Critical Risk",
            value: "2",
            sub: "Failure within 7 days",
            color: "bg-red-500/15 text-red-400",
          },
          {
            icon: AlertTriangle,
            label: "High Risk",
            value: "4",
            sub: "Failure within 30 days",
            color: "bg-amber-500/15 text-amber-400",
          },
          {
            icon: BrainCircuit,
            label: "Avg Confidence",
            value: "80.7%",
            sub: "Model accuracy",
            color: "bg-blue-500/15 text-blue-400",
          },
          {
            icon: Clock,
            label: "Avg Days to Failure",
            value: "20d",
            sub: "Across at-risk devices",
            color: "bg-indigo-500/15 text-indigo-400",
          },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="card p-5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={16} />
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

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Prediction list */}
        <div className="lg:col-span-3 card overflow-hidden">
          {/* Filter tabs */}
          <div className="px-4 pt-4 pb-3 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                AI Risk Predictions
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Ranked by failure probability
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1">
              {(["all", "critical", "warning"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all capitalize",
                    filter === f ?
                      "bg-blue-500/20 text-blue-400 border border-blue-500/25"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {filtered.map((p) => {
              const c = getRiskColor(p.riskScore);
              const isSelected = selected.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors",
                    isSelected ? "bg-blue-500/8" : (
                      "hover:bg-[var(--bg-elevated)]"
                    ),
                  )}
                >
                  <RiskGauge score={p.riskScore} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {p.equipment}
                      </p>
                      {p.trend === "worsening" && (
                        <TrendingUp
                          size={11}
                          className="text-red-400 flex-shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {p.dept} · {p.failureType}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                          c.text,
                          c.bg,
                          c.border,
                        )}
                      >
                        {p.riskScore >= 75 ?
                          "Critical"
                        : p.riskScore >= 50 ?
                          "Warning"
                        : "Low"}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        ~{p.estimatedDays}d to failure · {p.confidence}%
                        confidence
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      isSelected ? "text-blue-400" : "text-[var(--text-muted)]",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Risk breakdown radar */}
          <div className="card p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                  Risk Factor Breakdown
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate max-w-[180px]">
                  {selected.equipment}
                </p>
              </div>
              <span
                className={cn(
                  "text-xs font-bold",
                  getRiskColor(selected.riskScore).text,
                )}
              >
                {selected.riskScore}% risk
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Radar
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Contributing factors */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={13} className="text-[var(--text-muted)]" />
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                Contributing Factors
              </h3>
            </div>
            <div className="space-y-2">
              {selected.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {f}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Estimated failure window
                </p>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  Within {selected.estimatedDays} days
                </p>
              </div>
              <button className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Zap size={12} /> Schedule Now
              </button>
            </div>
          </div>

          {/* Trend chart */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">
              7-Day Risk Trend
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">
              Top 3 at-risk devices
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={riskTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="mindray"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  name="Mindray"
                />
                <Line
                  type="monotone"
                  dataKey="siemens"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="Siemens"
                />
                <Line
                  type="monotone"
                  dataKey="philips"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  dot={false}
                  name="Philips"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              {[
                { label: "Mindray", color: "#ef4444" },
                { label: "Siemens", color: "#f59e0b" },
                { label: "Philips", color: "#6366f1" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-0.5 rounded"
                    style={{ background: l.color }}
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Model info */}
          <div className="card p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Activity size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Model: MedPredict ML v2.1
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Trained on 4.2M equipment data points across 38 Nigerian
                hospitals. Last retrained May 15, 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
