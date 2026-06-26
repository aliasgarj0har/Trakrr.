import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "positive" | "negative" | "purple" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        variant === "default" && "bg-beige/10 text-beige/70",
        variant === "positive" && "bg-emerald-500/10 text-emerald-400",
        variant === "negative" && "bg-red-500/10 text-red-400",
        variant === "purple" && "bg-purple/20 text-purple-light",
        variant === "muted" && "bg-white/5 text-beige/40",
        className
      )}
    >
      {children}
    </span>
  );
}
