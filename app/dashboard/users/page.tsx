"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Loader2,
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardQuery } from "@/hooks/use-dashboard";
import { useUsersQuery } from "@/hooks/use-users";
import type { AdminUser } from "@/lib/api/users.api";

function getInitials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAccountStatus(user: AdminUser) {
  if (user.isDeactivatedByAdmin) return "suspended";
  if (user.isDead) return "inactive";
  if (user.inactivity?.lifeCheckStatus === "inactive") return "inactive";
  return "active";
}

function formatSubscription(status: string) {
  if (!status || status === "NO_SUBSCRIPTION") return "free";
  return status.replaceAll("_", " ").toLowerCase();
}

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function UsersTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-6" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-6" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-14 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function UsersPaginationSkeleton() {
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

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  const { data, isLoading, isError, error, refetch, isFetching } = useUsersQuery({
    page,
    limit: Number(limit),
    search: debouncedSearch.trim(),
  });

  const { data: dashboardStats, isLoading: isStatsLoading } =
    useDashboardQuery();

  const users = data?.data?.users ?? [];
  const pagination = data?.pagination;

  const statsCards = [
    {
      title: "Total Users",
      value: dashboardStats?.totalUser ?? 0,
      icon: Users,
      tone: "blue" as const,
    },
    {
      title: "Active Users",
      value: dashboardStats?.activeUsers ?? 0,
      icon: UserCheck,
      tone: "green" as const,
    },
    {
      title: "Inactive Users",
      value: dashboardStats?.inActiveUsers ?? 0,
      icon: UserX,
      tone: "slate" as const,
    },
    {
      title: "New Users",
      value: dashboardStats?.newUsers ?? 0,
      icon: UserPlus,
      tone: "sky" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        description="View, search, and manage all registered users."
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
          <div className="flex items-center justify-between gap-3">
            <CardTitle>All Users</CardTitle>
            {isFetching && !isLoading ? (
              <Loader2 className="text-primary size-4 animate-spin" />
            ) : null}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                className="pl-9"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{(error as Error)?.message || "Failed to load users."}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Memories</TableHead>
                <TableHead>Trusted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <UsersTableSkeleton rows={Number(limit)} />
              ) : (
                users.map((user) => {
                    const status = getAccountStatus(user);
                    const subscription = formatSubscription(
                      user.subscriptionStatus
                    );

                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              {user.profilePicture?.location ? (
                                <AvatarImage
                                  src={user.profilePicture.location}
                                  alt={user.name || user.email}
                                />
                              ) : null}
                              <AvatarFallback>
                                {getInitials(user.name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {user.name || "Unnamed User"}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {user.email}
                              </p>
                              {user.userName ? (
                                <p className="text-muted-foreground truncate text-[11px]">
                                  @{user.userName}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={subscription} />
                        </TableCell>
                        <TableCell>{user.uploadedMemoriesCount ?? 0}</TableCell>
                        <TableCell>
                          {user.trustedFriends?.length ?? 0}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell>
                          {formatDate(user.inactivity?.lastActiveAt)}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/dashboard/users/${user._id}`}
                              aria-label="View profile"
                            >
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>

          {!isLoading && users.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No users found.
            </p>
          ) : null}

          {isLoading ? (
            <UsersPaginationSkeleton />
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
                of {pagination.totalItems} users
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
                    if (pageNumber === 1 || pageNumber === pagination.totalPages)
                      return true;
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
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </Button>
                    )
                  )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || isFetching}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
