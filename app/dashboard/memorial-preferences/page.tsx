"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
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

import { useMemorials } from "@/hooks/use-memorial";
import { truncate } from "@/lib/utils/truncate";

// Simple debounced value hook (mirrors the one used in Users page)
function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
const PAGE_SIZE = 10;
export default function MemorialPreferencesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(PAGE_SIZE);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError, error, refetch, isFetching } = useMemorials({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim(),
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const records = data?.data ?? [];
  const pagination = data?.pagination;

  const router = useRouter();

  const viewRecord = (id: string) => {
    router.push(`/dashboard/memorial-preferences/${id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Memorial Preferences"
        description="View memorial wishes, search records, export information, and flag incomplete entries."
      // actions={
      //   <Button onClick={() => toast.success("Memorial records exported")}>
      //     <Download className="size-4" /> Export Information
      //   </Button>
      // }
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Memorial Wishes</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                className="pl-9"
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{(error as Error)?.message || "Failed to load memorial records."}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Wishes</TableHead>
                <TableHead>Created At</TableHead>

                <TableHead>Service Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></TableCell>
                    <TableCell><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></TableCell>
                    <TableCell><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></TableCell>
                    <TableCell><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></TableCell>
                    <TableCell><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></TableCell>
                    <TableCell><div className="h-4 w-10 animate-pulse rounded bg-gray-200" /></TableCell>
                  </TableRow>
                ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center py-8">
                    No memorial records found
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium flex flex-col">
                      <p>{record.user.name}</p>
                      <span className="text-gray-500 text-sm">{record.user.email}</span>
                    </TableCell>
                    <TableCell>
                      <span title={record.wishes || ""}>{truncate(record.wishes) || "—"}</span>
                    </TableCell>

                    <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>

                    <TableCell>{truncate(record.serviceType, 10) || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => viewRecord(record._id)}>
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {isLoading ? null : pagination ? (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Showing{" "}
                {pagination.totalItems === 0
                  ? 0
                  : (pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                –{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                {pagination.totalItems} records
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((pageNumber) => {
                    if (pagination.totalPages <= 5) return true;
                    if (pageNumber === 1 || pageNumber === pagination.totalPages) return true;
                    return Math.abs(pageNumber - page) <= 1;
                  })
                  .reduce((acc, pageNumber, idx, arr) => {
                    if (idx > 0) {
                      const prev = arr[idx - 1];
                      if (pageNumber - prev > 1) acc.push("ellipsis");
                    }
                    acc.push(pageNumber);
                    return acc;
                  }, [] as (number | "ellipsis")[])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${idx}`} className="text-muted-foreground px-1 text-sm">
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
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}