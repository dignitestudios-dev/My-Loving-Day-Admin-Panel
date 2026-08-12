"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";

import { useResources, useCreateResource, useUpdateResource, useDeleteResource } from "@/hooks/use-resources";
import { ResourceItem } from "@/lib/api/resources.api";
import { Skeleton } from "@/components/ui/skeleton";

const emptyForm = {
  title: "",
  description: "",
};

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ResourcesPage() {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  // page 1 pe le aao jab bhi search badlein
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data, isLoading, isError, error, refetch } = useResources({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const resources = data?.data || [];
  const pagination = data?.pagination;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sare mutation hooks top-level pe — component ke andar hooks kabhi
  // event handler ya loop ke andar call nahi karte (Rules of Hooks)
  const { mutate: createResource, isPending: isCreating } = useCreateResource();
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource();
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setOpen(true);
  };

  const openEdit = (resource: ResourceItem) => {
    setEditingId(resource._id);
    setForm({
      title: resource.title,
      description: "",
    });
    setSelectedFile(null);
    setOpen(true);
  };

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message ?? "Failed to load resources");
    }
  }, [isError, error]);

  const saveResource = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      files: selectedFile,
    };

    if (editingId) {
      updateResource(
        { id: editingId, body: body as any },
        {
          onSuccess: () => {
            toast.success("Resource updated successfully");
            setOpen(false);
            refetch(); // list ko taza data ke saath refresh karo
          },
          onError: (err) => toast.error(err?.message ?? "Failed to update resource"),
        }
      );
    } else {
      createResource(body as any, {
        onSuccess: () => {
          toast.success("Resource created successfully");
          setOpen(false);
          setPage(1); // naya resource top pe dekhne ke liye page 1 pe le aao
          refetch(); // list ko taza data ke saath refresh karo
        },
        onError: (err) => toast.error(err?.message ?? "Failed to create resource"),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteResource(id as any, {
      onSuccess: () => {
        toast.success("Resource deleted successfully");
        refetch(); // list ko taza data ke saath refresh karo
      },
      onError: (err) => toast.error(err?.message ?? "Failed to delete resource"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resources Management"
        description="Manage educational articles, videos, guides, and FAQs."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4 mr-2" />
            Create Resource
          </Button>
        }
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Educational Resources</CardTitle>
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              className="pl-9"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No resources found.
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => (
                  <TableRow key={resource._id}>
                    <TableCell className="font-medium">{resource.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {resource.description || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(resource)}>
                            <Pencil className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(resource._id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-end items-center gap-4 mt-4">
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Resource" : "Create Resource"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="res-title">Title</Label>
              <Input
                id="res-title"
                placeholder="Enter title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="res-description">Description</Label>
              <Textarea
                id="res-description"
                placeholder="Enter description..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>File</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setSelectedFile(f);
                }}
              />

              {selectedFile ? (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                  <span className="flex-1 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {selectedFile.size < 1024 * 1024
                      ? `${(selectedFile.size / 1024).toFixed(0)} KB`
                      : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors w-full justify-center"
                >
                  <Upload className="size-4" />
                  Click to upload a file
                </button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={saveResource} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}