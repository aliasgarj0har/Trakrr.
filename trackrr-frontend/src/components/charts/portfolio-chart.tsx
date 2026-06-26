"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { FlaskChart } from "@/types";

interface PortfolioChartProps {
  chart: FlaskChart;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs space-y-1">
      <p className="text-beige/50 mb-1.5">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(1)}
        </p>
      ))}
    </div>
  );
}

export function PortfolioChart({ chart }: PortfolioChartProps) {
  if (!chart.dates.length) {
    return (
      <div className="h-52 flex items-center justify-center text-beige/30 text-sm">
        No history yet
      </div>
    );
  }

  // Build recharts data array, sample to max 80 points for performance
  const step = Math.max(1, Math.floor(chart.dates.length / 80));
  const points = chart.dates
    .filter((_, i) => i % step === 0)
    .map((date, i) => ({
      date,
      Portfolio: chart.portfolio[i * step],
      "Nifty 50": chart.nifty[i * step],
      "S&P 500": chart.sp500[i * step],
    }));

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(245,240,232,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "rgba(245,240,232,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}`}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "10px", color: "rgba(245,240,232,0.5)" }}
          />
          <Line type="monotone" dataKey="Portfolio" stroke="#7c3aed" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Nifty 50" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="S&P 500" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
