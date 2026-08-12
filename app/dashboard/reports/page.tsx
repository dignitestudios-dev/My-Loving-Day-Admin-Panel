"use client";

import { useState, useEffect } from "react";
import { Search, Flag, ChevronLeft, ChevronRight, Mail, AtSign, Calendar, FileText, User, CheckCircle2, XCircle } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useReports, useUpdateReport, useReportsDashboard } from "@/hooks/use-reports";
import { ReportItem } from "@/lib/api/reports.api";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";

// ── Debounce ───────────────────────────────────────────────────────────────────
function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatDate(v?: string) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name?: string) {
  if (!name?.trim()) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function ReportsSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          <TableCell className="py-2"><Skeleton className="h-4 w-[140px]" /></TableCell>
          <TableCell className="py-2"><Skeleton className="h-4 w-[140px]" /></TableCell>
          <TableCell className="py-2"><Skeleton className="h-4 w-[180px]" /></TableCell>
          <TableCell className="py-2"><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell className="py-2"><Skeleton className="h-4 w-[90px]" /></TableCell>
          <TableCell className="py-2"><Skeleton className="h-6 w-6 rounded" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function ReportsPaginationSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-4 w-44" />
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="size-8" />
        <Skeleton className="size-8" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

// ── Detail Dialog ──────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
        <span className="text-sm font-medium break-words">{value || <span className="text-muted-foreground font-normal italic">Not provided</span>}</span>
      </div>
    </div>
  );
}

function UserCard({ label, user }: { label: string; user?: { _id?: string; name?: string; email?: string; userName?: string } }) {
  if (!user) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex flex-col gap-0.5">
          <p className="font-semibold text-sm truncate">{user.name || "—"}</p>
          {user.userName && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <AtSign className="size-3 shrink-0" />{user.userName}
            </p>
          )}
          {user.email && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="size-3 shrink-0" />{user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportDetailDialog({ report, open, onClose }: { report: ReportItem | null; open: boolean; onClose: () => void }) {
  const [pendingAction, setPendingAction] = useState<"accept" | "reject" | null>(null);
  const { mutate: updateReport, isPending } = useUpdateReport();

  useEffect(() => {
    if (!open) setPendingAction(null);
  }, [open]);

  if (!report) return null;

  const reportedTarget = report.reportedUser ? "User" : report.reportedPost ? "Post" : "Unknown";

  const handleAction = (action: "accept" | "reject") => {
    if (pendingAction !== action) {
      setPendingAction(action);
      return;
    }
    updateReport(
      { id: report._id, action },
      {
        onSuccess: () => {
          toast.success(`Report ${action === "accept" ? "accepted" : "rejected"} successfully`);
          onClose();
        },
        onError: (err) => toast.error(err?.message ?? "Action failed"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="size-4 text-destructive" />
            Report Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <UserCard label="Reported By" user={report.reportedBy} />

          {report.reportedUser && (
            <UserCard label="Reported User" user={report.reportedUser} />
          )}

          {report.reportedPost && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Reported Post</span>
              <div className="rounded-xl border bg-muted/30 p-3 flex items-start gap-2">
                <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">
                    {report.reportedPost.title || report.reportedPost.caption || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{report.reportedPost._id}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-3">
            <InfoRow icon={Flag} label="Reason" value={report.reason} />
            {report.description && (
              <InfoRow icon={FileText} label="Description" value={report.description} />
            )}
            <InfoRow icon={User} label="Reported" value={reportedTarget} />
            {report.type && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
                  <Flag className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Type</span>
                  <Badge variant="secondary" className="capitalize w-fit">{report.type}</Badge>
                </div>
              </div>
            )}
            {report.status && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
                  <Flag className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Status</span>
                  <Badge variant="outline" className="capitalize w-fit">{report.status}</Badge>
                </div>
              </div>
            )}
            <InfoRow icon={Calendar} label="Reported At" value={formatDate(report.createdAt)} />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Take Action</p>

            {pendingAction && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                Confirm: <strong className="capitalize">{pendingAction}</strong> this report? Click the button again to confirm.
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="default"
                className={`flex-1 text-white ${pendingAction === "accept"
                  ? "bg-green-700 hover:bg-green-800 ring-2 ring-green-500"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
                disabled={isPending}
                onClick={() => handleAction("accept")}
              >
                <CheckCircle2 className="size-4 mr-2" />
                {isPending && pendingAction === "accept" ? "Accepting..." : pendingAction === "accept" ? "Confirm Accept" : "Accept"}
              </Button>
              <Button
                variant={pendingAction === "reject" ? "default" : "destructive"}
                className={`flex-1 ${pendingAction === "reject" ? "ring-2 ring-red-400 bg-red-700 hover:bg-red-800 text-white" : ""
                  }`}
                disabled={isPending}
                onClick={() => handleAction("reject")}
              >
                <XCircle className="size-4 mr-2" />
                {isPending && pendingAction === "reject" ? "Rejecting..." : pendingAction === "reject" ? "Confirm Reject" : "Reject"}
              </Button>
            </div>

            {pendingAction && (
              <button
                className="text-xs text-muted-foreground underline underline-offset-2 text-center"
                onClick={() => setPendingAction(null)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError, error, refetch } = useReports({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reports: ReportItem[] = (data as any)?.data?.data ?? (data as any)?.data ?? [];
  const pagination = (data as any)?.data?.pagination;

  // ── Dashboard stats — /admin/reports/dashboard ──
  const { data: dashboardRes, isLoading: isStatsLoading } = useReportsDashboard();
  const dashboardStats = dashboardRes?.data;

  const statsCards = [
    {
      title: "Pending Reports",
      value: dashboardStats?.pendingReports ?? 0,
      icon: Flag,
      tone: "sky" as const,
    },
    {
      title: "Resolved Reports",
      value: dashboardStats?.resolvedReports ?? 0,
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      title: "User Reports",
      value: dashboardStats?.userReports ?? 0,
      icon: User,
      tone: "blue" as const,
    },
    {
      title: "Post Reports",
      value: dashboardStats?.postReports ?? 0,
      icon: FileText,
      tone: "slate" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Review and manage user-submitted reports."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isStatsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-xl border bg-white p-3.5 shadow-sm"
            >
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-5 w-10" />
              </div>
            </div>
          ))
          : statsCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={String(card.value)}
              icon={card.icon}
              tone={card.tone}
            />
          ))}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>All Reports</CardTitle>
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              className="pl-9"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{(error as Error)?.message ?? "Failed to load reports."}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reported By</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <ReportsSkeleton />
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Flag className="size-8 opacity-30" />
                      <p className="text-sm">No reports found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow
                    key={report._id}
                    className="cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell>
                      {report.reportedBy ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{report.reportedBy.name || "—"}</span>
                          <span className="text-xs text-muted-foreground">{report.reportedBy.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {report.reportedUser ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{report.reportedUser.name || "—"}</span>
                          <span className="text-xs text-muted-foreground">{report.reportedUser.email}</span>
                        </div>
                      ) : report.reportedPost ? (
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="secondary" className="w-fit text-[10px]">
                            Post
                          </Badge>
                          <span className="max-w-[160px] truncate text-sm">
                            {report.reportedPost.title || report.reportedPost.caption || report.reportedPost._id}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="max-w-[180px] truncate text-sm" title={report.reason}>
                      {report.reason || "—"}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm capitalize">{report.type || "—"}</span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={report.status as any} />
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                        >
                          <CheckCircle2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-red-50"
                          title="Reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                        >
                          <XCircle className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {isLoading ? (
            <ReportsPaginationSkeleton />
          ) : pagination ? (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Showing{" "}
                {pagination.totalItems === 0
                  ? 0
                  : (pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                –
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} reports
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, index) => index + 1
                )
                  .filter((pageNumber) => {
                    if (pagination.totalPages <= 5) return true;
                    if (pageNumber === 1 || pageNumber === pagination.totalPages) return true;
                    return Math.abs(pageNumber - page) <= 1;
                  })
                  .reduce<(number | "ellipsis")[]>((acc, pageNumber, index, arr) => {
                    if (index > 0) {
                      const prev = arr[index - 1];
                      if (pageNumber - prev > 1) acc.push("ellipsis");
                    }
                    acc.push(pageNumber);
                    return acc;
                  }, [])
                  .map((item, index) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="text-muted-foreground px-1 text-sm"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={item}
                        variant={page === item ? "default" : "outline"}
                        size="sm"
                        className="min-w-8 px-2"
                        disabled={isFetching}
                        onClick={() => setPage(item as number)}
                      >
                        {item}
                      </Button>
                    )
                  )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || isFetching}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ReportDetailDialog
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}