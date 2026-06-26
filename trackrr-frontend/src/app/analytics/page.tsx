"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { formatPercent, cn } from "@/lib/utils";
import { BarChart3, Shield, Zap, Target, TrendingUp, TrendingDown } from "lucide-react";

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(Math.abs(value) / max, 1) * 100;
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, loading } = usePortfolio();

  // Flask fields map directly: sharpe, alpha, max_dd, best_day, worst_day, nifty_total, sp500_total
  const riskMetrics = [
    {
      label: "Sharpe Ratio",
      value: data?.sharpe,
      format: (v: number) => v.toFixed(2),
      desc: "Risk-adjusted return (annualised). >1 is good, >2 is excellent.",
      icon: <Zap size={14} />, max: 3, color: "#7c3aed",
      positive: (v: number) => v > 1,
    },
    {
      label: "Max Drawdown",
      value: data?.max_dd,
      format: (v: number) => `${v.toFixed(2)}%`,
      desc: "Largest peak-to-trough decline. Closer to 0% is better.",
      icon: <Shield size={14} />, max: 30, color: "#ef4444",
      positive: (v: number) => v > -15,
    },
    {
      label: "Alpha vs Nifty 50",
      value: data?.alpha,
      format: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`,
      desc: "Excess return over Nifty 50. Positive = outperforming the benchmark.",
      icon: <Target size={14} />, max: 30, color: "#10b981",
      positive: (v: number) => v > 0,
    },
    {
      label: "Best Day",
      value: data?.best_day,
      format: (v: number) => `+${v.toFixed(2)}%`,
      desc: "Best single-day portfolio return since inception.",
      icon: <TrendingUp size={14} />, max: 5, color: "#f59e0b",
      positive: () => true,
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-beige tracking-tight">Analytics</h1>
        <p className="text-beige/40 text-sm mt-1">Risk metrics &amp; performance vs benchmarks</p>
      </div>

      {/* Risk metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : riskMetrics.map(({ label, value, format, desc, icon, max, color, positive }) => (
              <Card key={label}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-beige/40">{icon}</span>
                  <span className="text-xs font-medium text-beige/50 uppercase tracking-wider">{label}</span>
                </div>
                {value !== undefined && value !== null ? (
                  <>
                    <p className={cn("text-3xl font-bold tracking-tight", positive(value) ? "text-emerald-400" : "text-red-400")}>
                      {format(value)}
                    </p>
                    <MetricBar value={value} max={max} color={color} />
                  </>
                ) : (
                  <p className="text-2xl font-bold text-beige/20">—</p>
                )}
                <p className="text-xs text-beige/35 mt-3 leading-relaxed">{desc}</p>
              </Card>
            ))}
      </div>

      {/* Benchmark comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : [
              { label: "Portfolio Return", value: data?.total_ret ?? 0, color: "#7c3aed" },
              { label: "Nifty 50", value: data?.nifty_total ?? 0, color: "#10b981" },
              { label: "S&P 500", value: data?.sp500_total ?? 0, color: "#f59e0b" },
            ].map(({ label, value, color }) => {
              const pos = value >= 0;
              return (
                <Card key={label}>
                  <p className="text-xs text-beige/40 uppercase tracking-wider mb-2">{label}</p>
                  <p className="text-2xl font-bold" style={{ color }}>
                    {formatPercent(value)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {pos ? <TrendingUp size={11} className="text-emerald-400" /> : <TrendingDown size={11} className="text-red-400" />}
                    <span className="text-xs text-beige/30">since {data?.start_date ?? "01 Jan 2026"}</span>
                  </div>
                </Card>
              );
            })}
      </div>

      {/* Holdings performance bars */}
      <Card>
        <CardHeader>
          <CardTitle>Position Returns</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 h-3 bg-white/5 rounded animate-pulse" />
                  <div className="flex-1 h-3 bg-white/5 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-white/5 rounded animate-pulse" />
                </div>
              ))
            : data?.holdings
                .slice().sort((a, b) => b.total_ret - a.total_ret)
                .map((h) => {
                  const pos = h.total_ret >= 0;
                  const maxPct = Math.max(...(data.holdings.map((x) => Math.abs(x.total_ret))), 1);
                  return (
                    <div key={h.ticker} className="flex items-center gap-3 text-sm">
                      <span className="text-beige/60 w-28 text-xs font-mono truncate">{h.ticker}</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(Math.abs(h.total_ret) / maxPct) * 100}%`, background: pos ? "#10b981" : "#ef4444" }}
                        />
                      </div>
                      <span className={cn("text-xs font-semibold w-16 text-right", pos ? "text-emerald-400" : "text-red-400")}>
                        {pos ? "+" : ""}{h.total_ret.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio vs Benchmarks (Indexed)</CardTitle>
        </CardHeader>
        {loading
          ? <div className="h-52 bg-white/5 rounded-lg animate-pulse" />
          : <PortfolioChart chart={data?.chart ?? { dates: [], portfolio: [], nifty: [], sp500: [] }} />
        }
      </Card>

      {/* Worst day callout */}
      {data && (
        <Card>
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-beige/40 uppercase tracking-wider mb-1">Worst Day</p>
              <p className="text-red-400 text-xl font-bold">{data.worst_day.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-beige/40 uppercase tracking-wider mb-1">Best Day</p>
              <p className="text-emerald-400 text-xl font-bold">+{data.best_day.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-beige/40 uppercase tracking-wider mb-1">Sharpe Ratio</p>
              <p className="text-purple-light text-xl font-bold">{data.sharpe.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
