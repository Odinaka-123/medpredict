import { NextRequest, NextResponse } from "next/server";

interface PredictInput {
  usageHours: number;
  failureCount: number;
  daysSinceLastMaint: number;
  isOverdue: boolean;
  emergencyCount: number;
  ageYears: number;
}

function computeRiskScore(input: PredictInput): number {
  const usageScore = Math.min(100, (input.usageHours / 10000) * 100);
  const failureScore = Math.min(100, (input.failureCount / 10) * 100);
  const ageScore = Math.min(100, (input.ageYears / 10) * 100);
  const maintScore = Math.min(100, (input.daysSinceLastMaint / 180) * 100);
  const overdueScore = input.isOverdue ? 95 : 20;
  const emergScore = Math.min(100, input.emergencyCount * 20);

  return Math.round(
    usageScore * 0.2 +
      failureScore * 0.25 +
      ageScore * 0.1 +
      maintScore * 0.2 +
      overdueScore * 0.15 +
      emergScore * 0.1,
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: PredictInput = await req.json();

    const riskScore = computeRiskScore(body);

    const riskLevel =
      riskScore >= 75 ? "critical"
      : riskScore >= 50 ? "high"
      : riskScore >= 25 ? "medium"
      : "low";

    const estimatedDaysToFailure =
      riskScore >= 90 ? 3
      : riskScore >= 80 ? 7
      : riskScore >= 70 ? 14
      : riskScore >= 60 ? 21
      : riskScore >= 50 ? 30
      : null;

    const recommendedAction =
      riskScore >= 75 ? "Schedule emergency maintenance immediately"
      : riskScore >= 50 ? "Schedule preventive maintenance within 2 weeks"
      : riskScore >= 25 ? "Monitor closely and plan next service"
      : "Continue routine maintenance schedule";

    const confidence = Math.min(
      98,
      Math.max(
        55,
        50 +
          (body.failureCount > 0 ? 15 : 0) +
          (body.usageHours > 1000 ? 10 : 0) +
          (body.emergencyCount > 0 ? 10 : 0),
      ),
    );

    return NextResponse.json({
      riskScore,
      riskLevel,
      estimatedDaysToFailure,
      recommendedAction,
      confidence,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    description: "MedPredict risk prediction API",
    version: "2.1",
  });
}
