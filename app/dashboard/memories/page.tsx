"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Heart, CalendarClock, Send } from "lucide-react";
import { usePosts } from "@/hooks/use-posts";
import { Skeleton } from "@/components/ui/skeleton";

function MemoriesTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}


export default function MemoriesPage() {
  const PAGE_SIZE = 10;

  // Filters — inhe seedha API call mein bhejenge, frontend pe filter nahi karenge
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  // Typing rukne ke 400ms baad hi search value set hogi — har letter pe API call nahi hoga
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Jab bhi koi filter badle, page wapas 1 pe le aao (warna page 5 pe empty result aa sakta hai)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status]);

  // "all" ka matlab hai koi filter nahi — us case mein param bhejna hi nahi
  const { data, isLoading, isError, error, refetch } = usePosts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category: category === "all" ? undefined : category,
    status: status === "all" ? undefined : status,
  });

  const memories = data?.data || [];

  const removeMemory = (id: number) => {
    // TODO: yahan actual delete API call lagegi (e.g. mutation), phir refetch() call karna
    toast.success("Inappropriate content removed");
  };
  // console.log("memoriesData", memories);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Memory Management"
        description="Search, filter, review scheduled/released memories, and remove inappropriate content."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Memories" value={String(data?.total ?? memories.length)} icon={Heart} />
        {/* <StatCard
          title="Scheduled"
          value={String(memories.filter((m) => m.status === "scheduled").length)}
          icon={CalendarClock}
        /> */}
        {/* <StatCard
          title="Released"
          value={String(memories.filter((m) => m.status === "released").length)}
          icon={Send}
        /> */}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Memories</CardTitle>
            {/* <Button variant="outline" onClick={() => toast.message("Memory analytics opened")}>
              <BarChart3 className="size-4" />
              View Analytics
            </Button> */}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                className="pl-9"
                placeholder="Search memories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-destructive text-sm">
              {(error as Error)?.message || "Something went wrong"}
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <MemoriesTableSkeleton rows={PAGE_SIZE} />
              ) : memories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center py-8">
                    No memories found
                  </TableCell>
                </TableRow>
              ) : (
                memories.map((memory) => (
                  <TableRow key={memory._id ?? memory.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{memory?.user?.name}</span>
                        <span className="text-sm text-gray-500">{memory?.user?.email}</span>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[220px]">
                      <span
                        className="block truncate font-medium"
                        title={memory.title}
                      >
                        {memory.title}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={memory.status} />
                    </TableCell>

                    <TableCell>{new Date(memory.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={memory?.visibility} />
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/memories/${memory._id}`}>
                              <Eye className="size-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem onClick={() => toast.message(`Analytics for "${memory.title}"`)}>
                            <BarChart3 className="size-4" />
                            View Analytics
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuItem onClick={() => removeMemory(memory._id ?? memory.id)} className="text-destructive">
                            <Trash2 className="size-4" />
                            Remove Content
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>



          {/* Pagination Controls */}
          {isLoading ? (
            // Skeleton loader for pagination
            <div className="flex items-center justify-between mt-4 pt-4 border-t animate-pulse">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="flex gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-9 rounded bg-muted" />
                ))}
              </div>
            </div>
          ) : data?.pagination ? (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between mt-4">
              <p className="text-muted-foreground text-sm">
                Showing{" "}
                {data.pagination.totalItems === 0
                  ? 0
                  : (data.pagination.currentPage - 1) * data.pagination.itemsPerPage + 1}
                –
                {Math.min(
                  data.pagination.currentPage * data.pagination.itemsPerPage,
                  data.pagination.totalItems
                )}{" "}
                of {data.pagination.totalItems} memories
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                {Array.from(
                  { length: data.pagination.totalPages },
                  (_, index) => index + 1
                )
                  .filter((pageNumber) => {
                    if (data.pagination.totalPages <= 5) return true;
                    if (pageNumber === 1 || pageNumber === data.pagination.totalPages)
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
                        disabled={isLoading}
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </Button>
                    )
                  )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages || isLoading}
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(data.pagination.totalPages, prev + 1)
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