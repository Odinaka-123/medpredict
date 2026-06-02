"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Menu,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

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
  "/settings": {
    title: "Settings",
    subtitle: "Account and system preferences",
  },
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const path = usePathname();
  const router = useRouter();
  const { profile, user } = useAuth();
  console.log("user:", user?.displayName, user?.email);
  console.log("profile:", profile?.displayName);
  const page = PAGE_TITLES[path] ?? { title: "MedPredict", subtitle: "" };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  async function handleSignOut() {
    setDropdownOpen(false);
    await signOut(auth);
    router.push("/login");
  }

  // Derive initials and display name from auth
  const displayName =
    profile?.displayName ?? user?.displayName ?? user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const role = profile?.role ?? "Staff";

  // Quick nav items for search
  const NAV_ITEMS = [
    { label: "Overview", href: "/overview" },
    { label: "Equipment", href: "/equipment" },
    { label: "Maintenance", href: "/maintenance" },
    { label: "Predictions", href: "/predictions" },
    { label: "Reports", href: "/reports" },
    { label: "Settings", href: "/settings" },
  ];

  const searchResults =
    searchQuery.length > 0 ?
      NAV_ITEMS.filter((n) =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <>
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
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-muted)] w-52 hover:border-[var(--border-strong)] transition-colors"
          >
            <Search size={14} />
            <span className="text-xs flex-1 text-left">Search equipment…</span>
            <kbd className="text-[10px] bg-[var(--bg-surface)] border border-[var(--border)] px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--bg-base)]" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-[var(--text-primary)] leading-none">
                  {displayName}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 capitalize">
                  {role}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "text-[var(--text-muted)] hidden sm:block transition-transform",
                  dropdownOpen && "rotate-180",
                )}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <User size={14} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <div className="h-px bg-[var(--border)] my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <Search
                size={15}
                className="text-[var(--text-muted)] flex-shrink-0"
              />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages, equipment…"
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
              <kbd className="text-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
                ESC
              </kbd>
            </div>
            <div className="py-2 max-h-64 overflow-y-auto">
              {searchQuery === "" ?
                <div className="px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Quick navigation
                  </p>
                  {NAV_ITEMS.map((n) => (
                    <button
                      key={n.href}
                      onClick={() => {
                        router.push(n.href);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors text-left"
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              : searchResults.length > 0 ?
                <div className="px-4 py-2">
                  {searchResults.map((n) => (
                    <button
                      key={n.href}
                      onClick={() => {
                        router.push(n.href);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors text-left"
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              : <p className="px-7 py-4 text-sm text-[var(--text-muted)]">
                  No results for &ldquo;{searchQuery}&rdquo;
                </p>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
}
