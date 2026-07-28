import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  active: "border-green-200 bg-green-50 text-green-700",
  premium: "border-amber-200 bg-amber-50 text-amber-700",
  free: "border-slate-200 bg-slate-50 text-slate-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  suspended: "border-red-200 bg-red-50 text-red-700",
  inactive: "border-orange-200 bg-orange-50 text-orange-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  released: "border-emerald-200 bg-emerald-50 text-emerald-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  upcoming: "border-blue-200 bg-blue-50 text-blue-700",
  published: "border-green-200 bg-green-50 text-green-700",
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  private: "border-violet-200 bg-violet-50 text-violet-700",
  public: "border-sky-200 bg-sky-50 text-sky-700",
  shared: "border-cyan-200 bg-cyan-50 text-cyan-700",
  flagged: "border-orange-200 bg-orange-50 text-orange-700",
  incomplete: "border-yellow-200 bg-yellow-50 text-yellow-800",
  complete: "border-green-200 bg-green-50 text-green-700",
  pending: "border-yellow-200 bg-yellow-50 text-yellow-800",
  sent: "border-green-200 bg-green-50 text-green-700",
  reviewed: "border-slate-200 bg-slate-50 text-slate-700",
  warned: "border-amber-200 bg-amber-50 text-amber-700",
  banned: "border-red-200 bg-red-50 text-red-700",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", toneMap[key] ?? "border-border bg-muted", className)}
    >
      {status}
    </Badge>
  );
}
