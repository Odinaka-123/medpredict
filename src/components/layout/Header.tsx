"use client";

import { Bell, Menu, Search, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/overview": { title: "Overview", subtitle: "Facility health at a glance" },
  "/equipment": {
    title: "Equipment",
    subtitle: "Manage and monitor all devices",
  },
  "/maintenance": {
    title: "Maintenance",
    subtitle: "Logs, schedules and work orders",
  },
  "/predictions": {
    title: "Predictions",
    subtitle: "AI-powered failure risk analysis",
  },
  "/reports": { title: "Reports", subtitle: "Analytics and exports" },
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const path = usePathname();
  const page = PAGE_TITLES[path] ?? { title: "MedPredict", subtitle: "" };

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-[var(--bg-base)]/90 backdrop-blur border-b border-[var(--border)]">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] leading-none">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-muted)] w-52 cursor-pointer hover:border-[var(--border-strong)] transition-colors">
          <Search size={14} />
          <span className="text-xs">Search equipment…</span>
          <kbd className="ml-auto text-[10px] bg-[var(--bg-surface)] border border-[var(--border)] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--bg-base)]" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-all">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-[var(--text-primary)] leading-none">
              Admin User
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Administrator
            </p>
          </div>
          <ChevronDown
            size={14}
            className="text-[var(--text-muted)] hidden sm:block"
          />
        </button>
      </div>
    </header>
  );
}
