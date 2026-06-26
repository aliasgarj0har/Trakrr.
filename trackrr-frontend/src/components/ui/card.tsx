import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  purple?: boolean;
}

export function Card({ children, className, glow, purple }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 transition-all duration-200",
        purple ? "glass-purple" : "glass",
        glow && "glow-purple",
        "hover:border-purple-500/20",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-medium text-beige/60 uppercase tracking-wider", className)}>
      {children}
    </h3>
  );
}
