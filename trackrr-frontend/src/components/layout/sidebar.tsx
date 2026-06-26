"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  BarChart3,
  History,
  BookOpen,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/holdings", label: "Holdings", icon: Briefcase },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/learn", label: "Learn", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[220px] flex-col z-40"
        style={{ background: "rgba(15, 15, 26, 0.95)", borderRight: "1px solid rgba(245,240,232,0.06)" }}>
        
        {/* Logo */}
        <div className="px-6 py-7 border-b border-beige/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple flex items-center justify-center glow-purple">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-beige font-bold text-lg tracking-tight">Trackrr</span>
          </div>
          <p className="text-beige/30 text-xs mt-2 ml-9">Aliasgar Johar</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-purple/15 text-purple-light border border-purple/20"
                    : "text-beige/50 hover:text-beige/80 hover:bg-white/4"
                )}
              >
                <Icon size={16} className={active ? "text-purple-light" : ""} />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-light" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-beige/5">
          <p className="text-beige/20 text-xs">Paper Portfolio</p>
          <p className="text-beige/20 text-xs">Since 01 Jan 2026</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-3"
        style={{ background: "rgba(15,15,26,0.97)", borderTop: "1px solid rgba(245,240,232,0.06)" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all",
                active ? "text-purple-light" : "text-beige/35"
              )}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
