"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
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

type Resource = {
  id: number;
  title: string;
  type: "article" | "video" | "guide" | "faq";
  category: string;
  status: "published" | "draft";
  updatedAt: string;
};

const initialResources: Resource[] = [
  {
    id: 1,
    title: "How to Create Meaningful Memories",
    type: "article",
    category: "Getting Started",
    status: "published",
    updatedAt: "2026-07-12",
  },
  {
    id: 2,
    title: "Trusted Contacts Explained",
    type: "video",
    category: "Safety",
    status: "published",
    updatedAt: "2026-07-08",
  },
  {
    id: 3,
    title: "Planning Memorial Preferences",
    type: "guide",
    category: "Memorial",
    status: "draft",
    updatedAt: "2026-07-20",
  },
  {
    id: 4,
    title: "What happens after inactivity?",
    type: "faq",
    category: "Safety",
    status: "published",
    updatedAt: "2026-06-30",
  },
];

const emptyForm = {
  title: "",
  type: "article" as Resource["type"],
  category: "Getting Started",
  status: "draft" as Resource["status"],
};

export default function ResourcesPage() {
  const [resources, setResources] = useState(initialResources);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = resource.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || resource.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [resources, search, typeFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setForm({
      title: resource.title,
      type: resource.type,
      category: resource.category,
      status: resource.status,
    });
    setOpen(true);
  };

  const saveResource = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (editingId) {
      setResources((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : item
        )
      );
      toast.success("Resource updated");
    } else {
      setResources((prev) => [
        {
          id: Math.max(...prev.map((r) => r.id)) + 1,
          ...form,
          updatedAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      toast.success("Resource created");
    }
    setOpen(false);
  };

  const togglePublish = (id: number) => {
    setResources((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "published" ? "draft" : "published",
            }
          : item
      )
    );
    toast.success("Publish status updated");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resources Management"
        description="Manage educational articles, videos, guides, and FAQs."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Create Resource
          </Button>
        }
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Educational Resources</CardTitle>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                className="pl-9"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="faq">FAQs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell className="capitalize">{resource.type}</TableCell>
                  <TableCell>{resource.category}</TableCell>
                  <TableCell>
                    <StatusBadge status={resource.status} />
                  </TableCell>
                  <TableCell>{resource.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(resource)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => togglePublish(resource.id)}
                        >
                          {resource.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setResources((prev) =>
                              prev.filter((item) => item.id !== resource.id)
                            );
                            toast.success("Resource deleted");
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Resource" : "Create Resource"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value: Resource["type"]) =>
                  setForm({ ...form, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm({ ...form, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Getting Started">Getting Started</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Memorial">Memorial</SelectItem>
                  <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value: Resource["status"]) =>
                  setForm({ ...form, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Content</Label>
              <Textarea id="body" placeholder="Resource content..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveResource}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
