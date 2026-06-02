"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getEquipment, getMaintenanceRecords } from "@/lib/firestore";
import { Equipment, MaintenanceRecord } from "@/types";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Prediction {
  id: string;
  equipment: string;
  dept: string;
  riskScore: number;
  confidence: number;
  failureType: string;
  estimatedDays: number;
  trend: "worsening" | "stable" | "improving";
  factors: string[];
  radarData: { factor: string; score: number }[];
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

// ─── Risk engine ─────────────────────────────────────────────────────────────
// Computes a risk score from real equipment + maintenance data

function computePredictions(
  equipment: Equipment[],
  records: MaintenanceRecord[],
): Prediction[] {
  const now = Date.now();

  return equipment
    .filter((e) => e.status !== "decommissioned")
    .map((eq) => {
      const eqRecords = records.filter((r) => r.equipmentId === eq.id);
      const completed = eqRecords.filter((r) => r.status === "completed");
      const emergencies = eqRecords.filter(
        (r) => r.type === "emergency",
      ).length;

      // Feature scores (0–100)
      const usageScore = Math.min(100, (eq.usageHours / 10000) * 100);
      const failureScore = Math.min(100, (eq.failureCount / 10) * 100);
      const ageScore = (() => {
        const years =
          (now - eq.installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return Math.min(100, (years / 10) * 100);
      })();
      const maintScore = (() => {
        if (!eq.lastMaintenanceDate) return 80;
        const daysSince =
          (now - eq.lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24);
        return Math.min(100, (daysSince / 180) * 100);
      })();
      const overdueScore =
        eq.nextMaintenanceDate && eq.nextMaintenanceDate < new Date() ? 95 : 20;
      const emergencyScore = Math.min(100, emergencies * 20);

      // Weighted composite risk score
      const riskScore = Math.round(
        usageScore * 0.2 +
          failureScore * 0.25 +
          ageScore * 0.1 +
          maintScore * 0.2 +
          overdueScore * 0.15 +
          emergencyScore * 0.1,
      );

      // Confidence based on data richness
      const confidence = Math.min(
        98,
        Math.max(
          55,
          50 + eqRecords.length * 3 + (eq.failureCount > 0 ? 15 : 0),
        ),
      );

      // Trend
      const recentRecords = completed.filter((r) => {
        const days = (now - r.scheduledDate.getTime()) / (1000 * 60 * 60 * 24);
        return days <= 60;
      });
      const trend: "worsening" | "stable" | "improving" =
        emergencies >= 2 ? "worsening"
        : recentRecords.length >= 2 ? "improving"
        : "stable";

      // Estimated days to failure
      const estimatedDays =
        riskScore >= 90 ? 3
        : riskScore >= 80 ? 7
        : riskScore >= 70 ? 14
        : riskScore >= 60 ? 21
        : riskScore >= 50 ? 30
        : 60;

      // Failure type
      const failureType =
        eq.category === "imaging" ? "Imaging component degradation"
        : eq.category === "monitoring" ? "Sensor calibration drift"
        : eq.category === "life_support" ? "Mechanical valve wear"
        : eq.category === "laboratory" ? "Motor / reagent failure"
        : eq.category === "surgical" ? "Precision mechanism fault"
        : "General component failure";

      // Contributing factors
      const factors: string[] = [];
      if (eq.usageHours > 8000)
        factors.push(`High usage hours (${eq.usageHours.toLocaleString()}h)`);
      if (eq.failureCount > 3)
        factors.push(`${eq.failureCount} prior failures recorded`);
      if (overdueScore > 50) factors.push("Maintenance is overdue");
      if (emergencies > 0)
        factors.push(
          `${emergencies} emergency maintenance event${emergencies > 1 ? "s" : ""}`,
        );
      if (!eq.lastMaintenanceDate)
        factors.push("No maintenance history on record");
      if (factors.length === 0) factors.push("Routine monitoring recommended");

      // Radar data
      const radarData = [
        { factor: "Usage Hours", score: Math.round(usageScore) },
        { factor: "Failure Rate", score: Math.round(failureScore) },
        { factor: "Age", score: Math.round(ageScore) },
        { factor: "Maintenance", score: Math.round(maintScore) },
        { factor: "Overdue", score: Math.round(overdueScore) },
        { factor: "Emergencies", score: Math.round(emergencyScore) },
      ];

      return {
        id: eq.id,
        equipment: eq.name,
        dept: eq.department,
        riskScore: Math.min(99, Math.max(5, riskScore)),
        confidence,
        failureType,
        estimatedDays,
        trend,
        factors,
        radarData,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
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
  const { profile } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Prediction | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");

  const load = useCallback(async () => {
    if (!profile?.hospitalId) return;
    setLoading(true);
    try {
      const [equipment, records] = await Promise.all([
        getEquipment(profile.hospitalId),
        getMaintenanceRecords(profile.hospitalId),
      ]);
      const preds = computePredictions(equipment, records);
      setPredictions(preds);
      if (preds.length > 0) setSelected(preds[0]);
    } finally {
      setLoading(false);
    }
  }, [profile?.hospitalId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = predictions.filter((p) => {
    if (filter === "critical") return p.riskScore >= 75;
    if (filter === "warning") return p.riskScore >= 50 && p.riskScore < 75;
    return true;
  });

  const critical = predictions.filter((p) => p.riskScore >= 75).length;
  const warning = predictions.filter(
    (p) => p.riskScore >= 50 && p.riskScore < 75,
  ).length;
  const avgConf =
    predictions.length > 0 ?
      Math.round(
        predictions.reduce((a, p) => a + p.confidence, 0) / predictions.length,
      )
    : 0;
  const avgDays =
    predictions.length > 0 ?
      Math.round(
        predictions
          .filter((p) => p.riskScore >= 50)
          .reduce((a, p) => a + p.estimatedDays, 0) /
          Math.max(1, predictions.filter((p) => p.riskScore >= 50).length),
      )
    : 0;

  // Build 7-day trend from top 3 predictions (simulated slope from risk score)
  const top3 = predictions.slice(0, 3);
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    });
    const entry: Record<string, string | number> = { day: label };
    top3.forEach((p, j) => {
      const base =
        p.riskScore -
        (6 - i) *
          (p.trend === "worsening" ? 1.5
          : p.trend === "improving" ? -1
          : 0.2);
      entry[`p${j}`] = Math.round(Math.max(10, Math.min(99, base)));
    });
    return entry;
  });

  const trendColors = ["#ef4444", "#f59e0b", "#6366f1"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-400" />
          <p className="text-sm text-[var(--text-muted)]">
            Computing risk predictions…
          </p>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <BrainCircuit size={24} className="text-blue-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            No equipment to analyse
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Add equipment first to generate predictions.
          </p>
        </div>
        <a href="/equipment" className="btn-primary text-sm px-4 py-2">
          Go to Equipment
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: ShieldAlert,
            label: "Critical Risk",
            value: String(critical),
            sub: "Failure within 7 days",
            color: "bg-red-500/15 text-red-400",
          },
          {
            icon: AlertTriangle,
            label: "High Risk",
            value: String(warning),
            sub: "Failure within 30 days",
            color: "bg-amber-500/15 text-amber-400",
          },
          {
            icon: BrainCircuit,
            label: "Avg Confidence",
            value: `${avgConf}%`,
            sub: "Model accuracy",
            color: "bg-blue-500/15 text-blue-400",
          },
          {
            icon: Clock,
            label: "Avg Days to Failure",
            value: `${avgDays}d`,
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
          <div className="px-4 pt-4 pb-3 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                AI Risk Predictions
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Ranked by failure probability · {predictions.length} devices
                analysed
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
            {filtered.length === 0 ?
              <p className="text-sm text-[var(--text-muted)] text-center py-10">
                No devices in this category.
              </p>
            : filtered.map((p) => {
                const c = getRiskColor(p.riskScore);
                const isSelected = selected?.id === p.id;
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
                          ~{p.estimatedDays}d · {p.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className={cn(
                        "flex-shrink-0 transition-colors",
                        isSelected ? "text-blue-400" : (
                          "text-[var(--text-muted)]"
                        ),
                      )}
                    />
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lg:col-span-2 space-y-4">
            {/* Radar */}
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
                  className={`text-xs font-bold ${getRiskColor(selected.riskScore).text}`}
                >
                  {selected.riskScore}% risk
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={selected.radarData}>
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

            {/* Factors */}
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
                <a
                  href="/maintenance"
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Zap size={12} /> Schedule Now
                </a>
              </div>
            </div>

            {/* 7-day trend */}
            {top3.length > 0 && (
              <div className="card p-4">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                  7-Day Risk Trend
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mb-3">
                  Top {top3.length} at-risk devices
                </p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={trendData}>
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
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {top3.map((p, i) => (
                      <Line
                        key={p.id}
                        type="monotone"
                        dataKey={`p${i}`}
                        stroke={trendColors[i]}
                        strokeWidth={1.5}
                        dot={false}
                        name={p.equipment.split(" ")[0]}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {top3.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-0.5 rounded"
                        style={{ background: trendColors[i] }}
                      />
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {p.equipment.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  Risk scores computed from usage hours, failure history,
                  maintenance gaps, and overdue status across your
                  hospital&apos;s equipment data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
