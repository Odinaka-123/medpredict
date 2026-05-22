"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Wrench,
  BrainCircuit,
  FileBarChart2,
  Settings,
  LogOut,
  HeartPulse,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/overview", icon: LayoutDashboard, label: "Overview" },
  { href: "/equipment", icon: Activity, label: "Equipment" },
  { href: "/maintenance", icon: Wrench, label: "Maintenance" },
  { href: "/predictions", icon: BrainCircuit, label: "Predictions" },
  { href: "/reports", icon: FileBarChart2, label: "Reports" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const path = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 z-40 flex flex-col",
          "bg-[var(--bg-surface)] border-r border-[var(--border)]",
          "transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <HeartPulse size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)] text-sm leading-none">
                MedPredict
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Predictive Maintenance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Facility badge */}
        <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Facility
          </p>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 truncate">
            Lagos University Teaching Hospital
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-5 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Navigation
          </p>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = path === href || path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active ?
                    "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                <Icon size={17} className={active ? "text-blue-400" : ""} />
                {label}
                {label === "Predictions" && (
                  <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 border border-red-500/25 px-1.5 py-0.5 rounded-full font-semibold">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-0.5 border-t border-[var(--border)] pt-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
          >
            <Settings size={17} />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
