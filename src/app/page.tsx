"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      color: "bg-blue-500/10",
      iconColor: "#60a5fa",
      icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
      title: "Predictive risk scoring",
      desc: "AI models flag equipment likely to fail before they do, so you can act in advance — not after a crisis.",
    },
    {
      color: "bg-emerald-500/10",
      iconColor: "#34d399",
      icon: (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      ),
      title: "Maintenance scheduling",
      desc: "Plan and track preventive and corrective maintenance with reminders and cost tracking in naira.",
    },
    {
      color: "bg-amber-500/10",
      iconColor: "#fbbf24",
      icon: (
        <>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      ),
      title: "High-risk alerts",
      desc: "Critical and high-risk devices surface instantly in your dashboard so no alert falls through the cracks.",
    },
    {
      color: "bg-indigo-500/10",
      iconColor: "#a5b4fc",
      icon: (
        <>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </>
      ),
      title: "Live dashboard",
      desc: "Visual overview of your entire fleet — status, trends, downtime, and costs — updated in real time.",
    },
    {
      color: "bg-pink-500/10",
      iconColor: "#f472b6",
      icon: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ),
      title: "Multi-role access",
      desc: "Biomedical engineers, department heads, and admins each see exactly what they need.",
    },
    {
      color: "bg-teal-500/10",
      iconColor: "#2dd4bf",
      icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
      title: "MTTR & cost analytics",
      desc: "Track mean-time-to-repair and total maintenance spend over time to make better budgeting decisions.",
    },
  ];

  const stats = [
    { num: "340+", label: "Hospitals" },
    { num: "12k+", label: "Devices tracked" },
    { num: "68%", label: "Fewer failures" },
    { num: "₦2.4B", label: "Costs saved" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f1f5f9] font-sans">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 sm:px-8 h-16 max-w-[1200px] mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-blue-500 flex items-center justify-center">
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">
              Med<span className="text-blue-500">Predict</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {["Features", "Pricing", "Hospitals", "Docs"].map((l) => (
              <Link
                key={l}
                href="#"
                className="text-[13.5px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login">
              <button className="px-4 py-[7px] rounded-lg text-[13.5px] font-medium text-[#f1f5f9] border border-white/[0.15] hover:bg-white/[0.05] transition-colors cursor-pointer">
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-[7px] rounded-lg text-[13.5px] font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer">
                Get started
              </button>
            </Link>
          </div>

          {/* Mobile: auth + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login">
              <button className="px-3 py-[6px] rounded-lg text-[13px] font-medium text-[#f1f5f9] border border-white/[0.15] hover:bg-white/[0.05] transition-colors cursor-pointer">
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button className="px-3 py-[6px] rounded-lg text-[13px] font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer">
                Sign up
              </button>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="ml-1 w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.12] hover:bg-white/[0.05] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 text-[#94a3b8]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                viewBox="0 0 24 24"
              >
                {menuOpen ?
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                : <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#0d1421] px-4 py-3 flex flex-col gap-1">
            {["Features", "Pricing", "Hospitals", "Docs"].map((l) => (
              <Link
                key={l}
                href="#"
                onClick={() => setMenuOpen(false)}
                className="text-[14px] text-[#94a3b8] hover:text-[#f1f5f9] py-2.5 border-b border-white/[0.05] last:border-0 transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-[820px] mx-auto px-4 sm:px-8 pt-16 sm:pt-[90px] pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-[5px] rounded-full bg-blue-500/10 border border-blue-500/30 text-[12px] font-medium text-blue-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Built for Nigerian hospitals
        </div>

        <h1 className="text-[clamp(28px,6vw,56px)] font-extrabold leading-[1.1] tracking-[-1.5px] mb-5">
          Prevent equipment failures
          <br className="hidden sm:block" /> before they{" "}
          <span className="text-blue-500">cost lives</span>
        </h1>

        <p className="text-[15px] sm:text-[17px] text-[#94a3b8] leading-[1.65] max-w-[580px] mx-auto mb-8 px-2 sm:px-0">
          AI-powered predictive maintenance for medical equipment. Reduce
          downtime, cut costs, and keep your patients safe — purpose-built for
          Nigerian healthcare.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12 sm:mb-14">
          <Link href="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-[10px] text-[15px] font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer">
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Create free account
            </button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] text-[15px] font-medium text-[#f1f5f9] border border-white/[0.15] hover:bg-white/[0.05] transition-colors cursor-pointer">
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Log in
            </button>
          </Link>
        </div>

        {/* Stats strip — 2x2 on mobile, 4 across on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/[0.08] rounded-xl overflow-hidden max-w-[620px] mx-auto">
          {stats.map((s, i) => (
            <div
              key={i}
              className="py-4 px-3 sm:px-5 text-center border-b sm:border-b-0 border-r border-white/[0.08]
                         [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r
                         [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 [&:nth-child(4)]:border-r-0
                         sm:[&:nth-child(4)]:border-r-0"
            >
              <p className="text-[20px] sm:text-[22px] font-bold">{s.num}</p>
              <p className="text-[11px] sm:text-[11.5px] text-[#475569] mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <p className="text-center text-[11px] sm:text-[12px] font-semibold tracking-widest text-blue-500 uppercase mb-2.5">
          Why MedPredict
        </p>
        <h2 className="text-center text-[22px] sm:text-[28px] font-bold tracking-tight mb-2.5">
          Everything your team needs
        </h2>
        <p className="text-center text-[14px] sm:text-[15px] text-[#94a3b8] max-w-[460px] mx-auto mb-10 leading-relaxed px-2 sm:px-0">
          From real-time monitoring to AI failure prediction — all in one
          dashboard built for Nigerian healthcare infrastructure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-xl bg-[#111827] border border-white/[0.08] hover:border-white/[0.15] hover:bg-[#1a2235] transition-all"
            >
              <div
                className={`w-10 h-10 rounded-[10px] ${f.color} flex items-center justify-center mb-3`}
              >
                <svg
                  className="w-[19px] h-[19px]"
                  fill="none"
                  stroke={f.iconColor}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  {f.icon}
                </svg>
              </div>
              <p className="text-[13.5px] sm:text-[14px] font-semibold text-[#f1f5f9] mb-1.5">
                {f.title}
              </p>
              <p className="text-[12.5px] sm:text-[13px] text-[#94a3b8] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-[600px] mx-auto px-4 sm:px-8 pb-16 sm:pb-20">
        <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-[20px] sm:text-[26px] font-bold tracking-tight mb-3">
            Ready to reduce equipment failures?
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#94a3b8] mb-7 leading-relaxed">
            Join hospitals across Nigeria already using MedPredict to keep their
            equipment — and their patients — in safe hands.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-3 rounded-[9px] text-[14.5px] font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer">
                Create account
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-7 py-3 rounded-[9px] text-[14.5px] font-medium text-[#f1f5f9] border border-white/[0.15] hover:bg-white/[0.05] transition-colors cursor-pointer">
                Log in
              </button>
            </Link>
          </div>
          <p className="text-[12px] text-[#475569] mt-3.5">
            Free to get started — no credit card required
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.08] px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span className="text-[14px] font-semibold text-[#94a3b8]">
            Med<span className="text-blue-500">Predict</span>
          </span>
          <span className="text-[12px] text-[#475569]">
            © 2025 MedPredict. Built for Nigerian healthcare.
          </span>
        </div>
      </footer>
    </div>
  );
}
