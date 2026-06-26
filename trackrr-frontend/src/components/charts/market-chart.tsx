"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { FlaskPriceHistory } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-beige/50 mb-1">{label}</p>
      <p className="text-beige font-semibold">
        ₹{Number(payload[0].value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function MarketChart({ history }: { history: FlaskPriceHistory }) {
  const step = Math.max(1, Math.floor(history.dates.length / 100));
  const points = history.dates
    .filter((_, i) => i % step === 0)
    .map((date, i) => ({ date, price: history.close[i * step] }))
    .filter((p) => p.price !== null);

  const first = points[0]?.price ?? 0;
  const last = points[points.length - 1]?.price ?? 0;
  const isPos = (last as number) >= (first as number);

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPos ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
              <stop offset="100%" stopColor={isPos ? "#10b981" : "#ef4444"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: "rgba(245,240,232,0.3)", fontSize: 10 }}
            axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "rgba(245,240,232,0.3)", fontSize: 10 }}
            axisLine={false} tickLine={false}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} width={48} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="price"
            stroke={isPos ? "#10b981" : "#ef4444"} strokeWidth={2}
            fill="url(#marketGrad)" dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: isPos ? "#10b981" : "#ef4444" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
