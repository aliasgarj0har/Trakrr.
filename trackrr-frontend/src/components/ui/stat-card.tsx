import { Card } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean | null;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, subValue, positive, icon, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-beige/50 uppercase tracking-widest">{label}</span>
        {icon && <span className="text-beige/30">{icon}</span>}
      </div>
      <div>
        <p className="text-2xl font-bold text-beige tracking-tight">{value}</p>
        {subValue && (
          <p
            className={cn(
              "text-sm mt-1 font-medium",
              positive === true && "text-emerald-400",
              positive === false && "text-red-400",
              positive === null && "text-beige/50"
            )}
          >
            {subValue}
          </p>
        )}
      </div>
    </Card>
  );
}
