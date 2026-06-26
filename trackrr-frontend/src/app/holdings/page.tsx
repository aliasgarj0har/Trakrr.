"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import type { FlaskHolding } from "@/types";

function exportCSV(holdings: FlaskHolding[], endVal: number) {
  const headers = ["Ticker", "Name", "Sector", "Shares", "Price", "Value (INR)", "Weight (%)", "Today (%)", "Total Return (%)"];
  const rows = holdings.map((h) => [
    h.ticker, h.name, h.sector, h.shares, h.price,
    h.value, h.weight, h.today_ret, h.total_ret,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trackrr-holdings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HoldingsPage() {
  const { data, loading } = usePortfolio();

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-beige tracking-tight">Holdings</h1>
          <p className="text-beige/40 text-sm mt-1">
            {data ? `${data.holdings.length} positions · Total ${formatCurrency(data.end_val)}` : "Loading..."}
          </p>
        </div>
        {data && (
          <button
            onClick={() => exportCSV(data.holdings, data.end_val)}
            className="flex items-center gap-2 glass rounded-lg px-3 py-2 text-xs text-beige/60 hover:text-beige transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige/5">
              {["Asset", "Sector", "Shares", "Price", "Value (INR)", "Today", "Total Return"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-beige/40 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-beige/5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              : data?.holdings.map((h) => {
                  const totalPos = h.total_ret >= 0;
                  const todayPos = h.today_ret >= 0;
                  return (
                    <tr key={h.ticker} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-beige">{h.ticker}</p>
                        <p className="text-xs text-beige/40 mt-0.5">{h.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="muted">{h.sector}</Badge>
                      </td>
                      <td className="px-5 py-4 text-beige/70">{h.shares}</td>
                      <td className="px-5 py-4 text-beige/80 font-mono text-xs">{h.price}</td>
                      <td className="px-5 py-4 text-beige font-semibold">{formatCurrency(h.value)}</td>
                      <td className="px-5 py-4">
                        <span className={cn("text-xs font-medium", todayPos ? "text-emerald-400" : "text-red-400")}>
                          {todayPos ? "+" : ""}{h.today_ret.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={totalPos ? "positive" : "negative"}>
                          {totalPos ? <TrendingUp size={10} className="mr-1 inline" /> : <TrendingDown size={10} className="mr-1 inline" />}
                          {totalPos ? "+" : ""}{h.total_ret.toFixed(2)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-36" />
              </div>
            ))
          : data?.holdings.map((h) => {
              const totalPos = h.total_ret >= 0;
              return (
                <Card key={h.ticker}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-beige">{h.ticker}</p>
                      <p className="text-xs text-beige/40 mt-0.5">{h.name}</p>
                    </div>
                    <Badge variant={totalPos ? "positive" : "negative"}>
                      {totalPos ? "+" : ""}{h.total_ret.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-beige/40">Shares</p>
                      <p className="text-beige font-medium mt-0.5">{h.shares}</p>
                    </div>
                    <div>
                      <p className="text-beige/40">Value</p>
                      <p className="text-beige font-medium mt-0.5">{formatCurrency(h.value)}</p>
                    </div>
                    <div>
                      <p className="text-beige/40">Today</p>
                      <p className={cn("font-medium mt-0.5", h.today_ret >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {h.today_ret >= 0 ? "+" : ""}{h.today_ret.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-beige/5 flex items-center justify-between text-xs">
                    <Badge variant="muted">{h.sector}</Badge>
                    <span className="text-beige/40 font-mono">{h.price}</span>
                  </div>
                </Card>
              );
            })}
      </div>
    </div>
  );
}