"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/auth";
import { UserRole } from "@/types";

const steps = ["Account", "Hospital", "Role"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    hospitalName: "",
    role: "technician" as UserRole,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function nextStep(e: React.FormEvent) {
    e.preventDefault();
    setStep((s) => Math.min(s + 1, 2));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(
        form.email,
        form.password,
        form.displayName,
        form.hospitalName,
        form.role,
      );
      router.push("/overview");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("email-already-in-use") ?
          "This email is already registered."
        : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const roleOptions: {
    value: UserRole;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      value: "admin",
      label: "Admin",
      description: "Full system access and user management",
      icon: "🏥",
    },
    {
      value: "technician",
      label: "Technician",
      description: "Manage equipment and maintenance records",
      icon: "🔧",
    },
    {
      value: "viewer",
      label: "Viewer",
      description: "Read-only access to reports and data",
      icon: "👁️",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020817] flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#020817] to-slate-950" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59,130,246,0.12) 0%, transparent 60%),
                              radial-gradient(circle at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              MedPredict
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Join 200+
              <br />
              <span className="text-blue-400">Nigerian hospitals.</span>
            </h2>
            <p className="text-slate-400 mt-4 text-base leading-relaxed max-w-sm">
              Set up your hospital&apos;s predictive maintenance system in
              minutes. No hardware required.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "⚡", text: "Get started in under 5 minutes" },
              { icon: "🔒", text: "Enterprise-grade security" },
              { icon: "📊", text: "Real-time failure predictions" },
              { icon: "🇳🇬", text: "Built for Nigerian healthcare" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-600 text-xs">
          Trusted by LUTH, UCH, UNTH and more
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">MedPredict</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step ? "bg-blue-500 text-white"
                    : i === step ?
                      "bg-blue-500/20 border border-blue-500 text-blue-400"
                    : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {i < step ?
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  : i + 1}
                </div>
                <span
                  className={`text-xs ${i === step ? "text-slate-300" : "text-slate-600"}`}
                >
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`w-6 h-px ${i < step ? "bg-blue-500" : "bg-slate-800"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {step === 0 ?
                "Create account"
              : step === 1 ?
                "Your hospital"
              : "Select your role"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {step === 0 ?
                "Enter your personal details"
              : step === 1 ?
                "Tell us about your facility"
              : "Choose your access level"}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Step 0 — Account */}
          {step === 0 && (
            <form onSubmit={nextStep} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Full name
                </label>
                <input
                  name="displayName"
                  type="text"
                  required
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="Dr. Amaka Okonkwo"
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.ng"
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showPassword ?
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    : <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    }
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </form>
          )}

          {/* Step 1 — Hospital */}
          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Hospital / facility name
                </label>
                <input
                  name="hospitalName"
                  type="text"
                  required
                  value={form.hospitalName}
                  onChange={handleChange}
                  placeholder="Lagos University Teaching Hospital"
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl py-3 text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Step 2 — Role */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                {roleOptions.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-colors text-left ${
                      form.role === r.value ?
                        "bg-blue-500/10 border-blue-500/50"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xl mt-0.5">{r.icon}</span>
                    <div>
                      <div
                        className={`font-medium text-sm ${form.role === r.value ? "text-blue-400" : "text-white"}`}
                      >
                        {r.label}
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {r.description}
                      </div>
                    </div>
                    {form.role === r.value && (
                      <div className="ml-auto mt-0.5">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl py-3 text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ?
                    <>
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
                      </svg>{" "}
                      Creating...
                    </>
                  : "Create account"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
