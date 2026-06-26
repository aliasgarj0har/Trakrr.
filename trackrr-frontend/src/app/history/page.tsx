"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortfolioChart } from "@/components/charts/portfolio-chart";

export default function HistoryPage() {
  const { data, loading } = usePortfolio();

  const chart = data?.chart;
  const dates = chart?.dates ?? [];

  const rows = dates.map((date, i) => ({
    date,
    portfolio: chart?.portfolio[i] ?? null,
    nifty: chart?.nifty[i] ?? null,
    sp500: chart?.sp500[i] ?? null,
  })).reverse();

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-beige tracking-tight">History</h1>
        <p className="text-beige/40 text-sm mt-1">
          Daily portfolio performance since {data?.start_date ?? "01 Jan 2026"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio vs Benchmarks</CardTitle>
          <Badge variant="muted">{dates.length} trading days</Badge>
        </CardHeader>
        <div style={{ minHeight: "220px" }}>
          {loading ? (
            <div className="h-56 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <PortfolioChart chart={chart ?? { dates: [], portfolio: [], nifty: [], sp500: [] }} />
          )}
        </div>
      </Card>

      {data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Portfolio", value: data.total_ret, color: "#7c3aed" },
            { label: "Nifty 50", value: data.nifty_total, color: "#10b981" },
            { label: "S&P 500", value: data.sp500_total, color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="text-center">
              <p className="text-xs text-beige/40 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-lg font-bold" style={{ color }}>
                {value >= 0 ? "+" : ""}{value.toFixed(2)}%
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-beige/5 flex items-center justify-between">
          <h3 className="text-xs font-medium text-beige/40 uppercase tracking-wider">Daily Snapshots</h3>
          <span className="text-xs text-beige/30">{dates.length} days</span>
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0" style={{ background: "rgba(15,15,26,0.97)" }}>
              <tr className="border-b border-beige/5">
                {["Date", "Portfolio (idx)", "Nifty 50", "S&P 500", "Day Δ"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-beige/40 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/5">
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row, i) => {
                    const prevRow = i < rows.length - 1 ? rows[i + 1] : null;
                    const dayDelta =
                      row.portfolio !== null && prevRow?.portfolio != null
                        ? ((row.portfolio - prevRow.portfolio) / prevRow.portfolio) * 100
                        : null;
                    const dayPos = dayDelta !== null ? dayDelta >= 0 : null;
                    return (
                      <tr key={row.date} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5 text-beige/70 font-mono text-xs">{row.date}</td>
                        <td className="px-5 py-3.5 text-beige font-semibold">
                          {row.portfolio !== null ? row.portfolio.toFixed(1) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-beige/50 text-xs">
                          {row.nifty !== null ? row.nifty.toFixed(1) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-beige/50 text-xs">
                          {row.sp500 !== null ? row.sp500.toFixed(1) : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {dayDelta !== null ? (
                            <Badge variant={dayPos ? "positive" : "negative"}>
                              {dayPos ? "+" : ""}{dayDelta.toFixed(2)}%
                            </Badge>
                          ) : (
                            <span className="text-beige/20 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}