"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { FlaskHolding } from "@/types";

const COLORS = ["#7c3aed", "#a78bfa", "#10b981", "#f59e0b", "#06b6d4"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-beige font-semibold">{d.name}</p>
      <p className="text-beige/50">{d.value}%</p>
    </div>
  );
}

export function AllocationChart({ holdings }: { holdings: FlaskHolding[] }) {
  if (!holdings.length) {
    return <div className="h-52 flex items-center justify-center text-beige/30 text-sm">No holdings</div>;
  }

  // Flask already gives us weight (% of portfolio)
  const data = holdings.map((h) => ({ name: h.ticker, value: h.weight }));

  return (
    <div className="space-y-3">
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-beige/60">{d.name}</span>
            </div>
            <span className="text-beige/80 font-medium">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
