import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatTone = "blue" | "green" | "amber" | "rose" | "sky" | "violet" | "teal" | "slate";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  growth?: number;
  hint?: string;
  tone?: StatTone;
}

const toneStyles: Record<
  StatTone,
  { iconWrap: string; icon: string; accent: string; glow: string }
> = {
  blue: {
    iconWrap: "bg-[#0254B8]/10",
    icon: "text-[#0254B8]",
    accent: "from-[#0254B8]/15",
    glow: "hover:border-[#0254B8]/30",
  },
  green: {
    iconWrap: "bg-emerald-500/10",
    icon: "text-emerald-600",
    accent: "from-emerald-500/15",
    glow: "hover:border-emerald-300",
  },
  amber: {
    iconWrap: "bg-amber-500/10",
    icon: "text-amber-600",
    accent: "from-amber-500/15",
    glow: "hover:border-amber-300",
  },
  rose: {
    iconWrap: "bg-rose-500/10",
    icon: "text-rose-600",
    accent: "from-rose-500/15",
    glow: "hover:border-rose-300",
  },
  sky: {
    iconWrap: "bg-sky-500/10",
    icon: "text-sky-600",
    accent: "from-sky-500/15",
    glow: "hover:border-sky-300",
  },
  violet: {
    iconWrap: "bg-violet-500/10",
    icon: "text-violet-600",
    accent: "from-violet-500/15",
    glow: "hover:border-violet-300",
  },
  teal: {
    iconWrap: "bg-teal-500/10",
    icon: "text-teal-600",
    accent: "from-teal-500/15",
    glow: "hover:border-teal-300",
  },
  slate: {
    iconWrap: "bg-slate-500/10",
    icon: "text-slate-600",
    accent: "from-slate-500/15",
    glow: "hover:border-slate-300",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  growth,
  hint,
  tone = "blue",
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border bg-white shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        styles.glow
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent",
          styles.accent
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 size-24 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-100",
          styles.iconWrap
        )}
      />

      <CardContent className="relative flex items-center gap-3 p-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105",
            styles.iconWrap
          )}
        >
          <Icon className={cn("size-4", styles.icon)} />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground truncate text-[10px] font-medium tracking-wide uppercase">
              {title}
            </p>
            {typeof growth === "number" ? (
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 px-1.5 py-0 text-[10px]",
                  growth >= 0
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                )}
              >
                {growth >= 0 ? (
                  <TrendingUp className="me-1 size-3" />
                ) : (
                  <TrendingDown className="me-1 size-3" />
                )}
                {growth >= 0 ? "+" : ""}
                {growth}%
              </Badge>
            ) : null}
          </div>
          <p className="text-foreground text-lg font-bold leading-none tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="text-muted-foreground text-[10px]">{hint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
