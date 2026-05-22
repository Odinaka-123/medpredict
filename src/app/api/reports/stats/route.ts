// app/api/reports/stats/route.ts
import { NextResponse } from "next/server";

// Centralized mock data simulating a database source
const ALL_MONTHLY_KPIS = [
  { month: "Jun", uptime: 85, mttr: 6.0, preventive: 10, cost: 450 },
  { month: "Jul", uptime: 88, mttr: 5.5, preventive: 11, cost: 410 },
  { month: "Aug", uptime: 90, mttr: 5.0, preventive: 13, cost: 380 },
  { month: "Sep", uptime: 84, mttr: 6.4, preventive: 15, cost: 590 },
  { month: "Oct", uptime: 86, mttr: 5.9, preventive: 12, cost: 440 },
  { month: "Nov", uptime: 87, mttr: 5.8, preventive: 12, cost: 420 },
  { month: "Dec", uptime: 83, mttr: 6.2, preventive: 14, cost: 580 },
  { month: "Jan", uptime: 89, mttr: 5.1, preventive: 18, cost: 390 },
  { month: "Feb", uptime: 81, mttr: 6.8, preventive: 16, cost: 610 },
  { month: "Mar", uptime: 91, mttr: 4.6, preventive: 20, cost: 340 },
  { month: "Apr", uptime: 93, mttr: 4.0, preventive: 22, cost: 290 },
  { month: "May", uptime: 94, mttr: 4.2, preventive: 24, cost: 270 },
];

const DEPT_DATA = [
  { dept: "ICU", uptime: 96, failures: 2, cost: 45 },
  { dept: "Radiology", uptime: 81, failures: 7, cost: 120 },
  { dept: "Theatre", uptime: 92, failures: 3, cost: 67 },
  { dept: "NICU", uptime: 88, failures: 4, cost: 89 },
  { dept: "Obstetrics", uptime: 97, failures: 1, cost: 23 },
  { dept: "Laboratory", uptime: 74, failures: 10, cost: 185 },
  { dept: "Cardiology", uptime: 93, failures: 2, cost: 41 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "7m";

  // Parse slice size based on period string
  let sliceCount = 7;
  if (period === "3m") sliceCount = 3;
  if (period === "12m") sliceCount = 12;

  // Slice the historical data up to the requested months
  const filteredKPIs = ALL_MONTHLY_KPIS.slice(-sliceCount);

  // Generate dynamic summaries based on the active dataset slice
  const currentMonth = filteredKPIs[filteredKPIs.length - 1];
  const prevMonth = filteredKPIs[filteredKPIs.length - 2] || currentMonth;

  // Calculate variances
  const uptimeDiff = (currentMonth.uptime - prevMonth.uptime).toFixed(1);
  const mttrDiff = (currentMonth.mttr - prevMonth.mttr).toFixed(1);
  const prevDiff = currentMonth.preventive - prevMonth.preventive;

  // Hypothetical corrective task changes
  const correctiveCount = Math.max(1, Math.round(currentMonth.mttr * 0.7));
  const prevCorrectiveCount = Math.max(1, Math.round(prevMonth.mttr * 1.1));
  const correctiveDiff = correctiveCount - prevCorrectiveCount;

  return NextResponse.json({
    monthlyKPIs: filteredKPIs,
    deptData: DEPT_DATA,
    summaryCards: [
      {
        label: "Avg Uptime",
        value: `${currentMonth.uptime}%`,
        sub: `${Number(uptimeDiff) >= 0 ? "+" : ""}${uptimeDiff}% vs last month`,
        isNegativeTrend: Number(uptimeDiff) < 0,
        color: "bg-emerald-500/15 text-emerald-400",
        type: "uptime",
      },
      {
        label: "Avg MTTR",
        value: `${currentMonth.mttr}h`,
        sub: `${Number(mttrDiff) >= 0 ? "+" : ""}${mttrDiff}h vs last month`,
        isNegativeTrend: Number(mttrDiff) > 0, // Higher MTTR is bad
        color: "bg-blue-500/15 text-blue-400",
        type: "mttr",
      },
      {
        label: "Preventive Tasks",
        value: `${currentMonth.preventive}`,
        sub: `${prevDiff >= 0 ? "+" : ""}${prevDiff} vs last month`,
        isNegativeTrend: prevDiff < 0,
        color: "bg-indigo-500/15 text-indigo-400",
        type: "preventive",
      },
      {
        label: "Corrective Tasks",
        value: `${correctiveCount}`,
        sub: `${correctiveDiff >= 0 ? "+" : ""}${correctiveDiff} vs last month`,
        isNegativeTrend: correctiveDiff > 0, // Higher failure tasks is bad
        color: "bg-amber-500/15 text-amber-400",
        type: "corrective",
      },
    ],
  });
}
