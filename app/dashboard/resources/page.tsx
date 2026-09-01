"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
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
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/utils/error";
import { filterSafeSearchInput } from "@/lib/utils/sanitize";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "mp4",
  "mov",
  "webm",
  "pdf",
  "doc",
  "docx",
];

function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) {
    return "Title is required";
  }
  if (trimmed.length < 3) {
    return "Title must be at least 3 characters";
  }
  if (trimmed.length > 100) {
    return "Title cannot exceed 100 characters";
  }
  return null;
}

function validateDescription(description: string): string | null {
  const trimmed = description.trim();
  if (!trimmed) {
    return "Description is required";
  }
  if (trimmed.length < 10) {
    return "Description must be at least 10 characters";
  }
  if (trimmed.length > 1000) {
    return "Description cannot exceed 1000 characters";
  }
  return null;
}

function validateFile(file: File | null): string | null {
  if (!file) return null;
  if (file.size > MAX_FILE_SIZE) {
    return "File size cannot exceed 50MB";
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return "Unsupported file format. Please upload an image, video, PDF, or Word document.";
  }
  return null;
}

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
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    file?: string;
  }>({});
  const [touched, setTouched] = useState<{
    title?: boolean;
    description?: boolean;
    file?: boolean;
  }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { mutate: createResource, isPending: isCreating } = useCreateResource();
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource();
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();
  const isSaving = isCreating || isUpdating;

  const openCreate = () => {
    setEditingId(null);
    setEditingResource(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setErrors({});
    setTouched({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpen(true);
  };

  const openEdit = (resource: ResourceItem) => {
    setEditingId(resource._id);
    setEditingResource(resource);
    setForm({
      title: resource.title || "",
      description: resource.description || "",
    });
    setSelectedFile(null);
    setErrors({});
    setTouched({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpen(true);
  };

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message ?? "Failed to load resources");
    }
  }, [isError, error]);

  const handleTitleChange = (val: string) => {
    setForm((prev) => ({ ...prev, title: val }));
    if (touched.title || errors.title) {
      const err = validateTitle(val);
      setErrors((prev) => ({ ...prev, title: err || undefined }));
    }
  };

  const handleTitleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
    const err = validateTitle(form.title);
    setErrors((prev) => ({ ...prev, title: err || undefined }));
  };

  const handleDescriptionChange = (val: string) => {
    setForm((prev) => ({ ...prev, description: val }));
    if (touched.description || errors.description) {
      const err = validateDescription(val);
      setErrors((prev) => ({ ...prev, description: err || undefined }));
    }
  };

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({ ...prev, description: true }));
    const err = validateDescription(form.description);
    setErrors((prev) => ({ ...prev, description: err || undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
    setTouched((prev) => ({ ...prev, file: true }));
    const err = validateFile(f);
    setErrors((prev) => ({ ...prev, file: err || undefined }));
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setErrors((prev) => ({ ...prev, file: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveResource = () => {
    setTouched({ title: true, description: true, file: true });

    const titleError = validateTitle(form.title);
    const descriptionError = validateDescription(form.description);
    const fileError = validateFile(selectedFile);

    const newErrors = {
      title: titleError || undefined,
      description: descriptionError || undefined,
      file: fileError || undefined,
    };
    setErrors(newErrors);

    if (titleError || descriptionError || fileError) {
      const firstErrorMessage = titleError || descriptionError || fileError;
      if (firstErrorMessage) {
        toast.error(firstErrorMessage);
      }
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
            refetch();
          },
          onError: (err) => {
            const message = getApiErrorMessage(err, "Failed to update resource");
            toast.error(message);
          },
        }
      );
    } else {
      createResource(body as any, {
        onSuccess: () => {
          toast.success("Resource created successfully");
          setOpen(false);
          setPage(1);
          refetch();
        },
        onError: (err) => {
          const message = getApiErrorMessage(err, "Failed to create resource");
          toast.error(message);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteResource(id as any, {
      onSuccess: () => {
        toast.success("Resource deleted successfully");
        refetch();
      },
      onError: (err) => {
        const message = getApiErrorMessage(err, "Failed to delete resource");
        toast.error(message);
      },
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
              onChange={(e) => setSearch(filterSafeSearchInput(e.target.value))}
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
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="res-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {form.title.length}/100
                </span>
              </div>
              <Input
                id="res-title"
                placeholder="Enter title..."
                value={form.title}
                maxLength={100}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                className={cn(
                  errors.title &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.title && (
                <p className="text-xs font-medium text-destructive">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="res-description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {form.description.length}/1000
                </span>
              </div>
              <Textarea
                id="res-description"
                placeholder="Enter description (min. 10 characters)..."
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onBlur={handleDescriptionBlur}
                className={cn(
                  errors.description &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.description && (
                <p className="text-xs font-medium text-destructive">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label>File Attachment</Label>
                <span className="text-[11px] text-muted-foreground">
                  Max 50MB
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                  <FileText className="size-4 text-primary shrink-0" />
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
                    onClick={clearSelectedFile}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : editingResource?.resourceImg && editingResource.resourceImg.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground shrink-0">
                        Current file:
                      </span>
                      <span className="text-xs font-medium truncate max-w-[170px]" title={editingResource.resourceImg[0]?.filename}>
                        {editingResource.resourceImg[0]?.filename || "Attached resource file"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-sm transition-colors w-full justify-center",
                    errors.file
                      ? "border-destructive/60 text-destructive bg-destructive/5"
                      : "border-muted-foreground/25 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <Upload className="size-4" />
                  Click to upload image, video, PDF or doc
                </button>
              )}

              {errors.file && (
                <p className="text-xs font-medium text-destructive">
                  {errors.file}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={saveResource} disabled={isSaving}>
              {isSaving ? "Saving..." : editingId ? "Update Resource" : "Create Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}