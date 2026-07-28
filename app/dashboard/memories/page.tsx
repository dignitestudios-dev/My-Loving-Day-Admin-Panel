"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
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

const initialMemories = [
  {
    id: 1,
    title: "Our Wedding Day",
    owner: "Ayesha Khan",
    category: "private",
    status: "scheduled",
    createdAt: "2026-06-12",
    releaseDate: "2027-06-12",
    views: 0,
  },
  {
    id: 2,
    title: "Letter to My Daughter",
    owner: "Sara Malik",
    category: "shared",
    status: "released",
    createdAt: "2026-02-01",
    releaseDate: "2026-07-01",
    views: 128,
  },
  {
    id: 3,
    title: "Family Picnic 2024",
    owner: "Usman Tariq",
    category: "public",
    status: "released",
    createdAt: "2025-11-20",
    releaseDate: "2026-01-01",
    views: 540,
  },
  {
    id: 4,
    title: "Advice for Hard Days",
    owner: "Hassan Raza",
    category: "private",
    status: "scheduled",
    createdAt: "2026-04-18",
    releaseDate: "2028-04-18",
    views: 0,
  },
  {
    id: 5,
    title: "Birthday Surprise Video",
    owner: "Fatima Noor",
    category: "shared",
    status: "scheduled",
    createdAt: "2026-05-09",
    releaseDate: "2026-09-15",
    views: 0,
  },
  {
    id: 6,
    title: "Inappropriate Demo Clip",
    owner: "Bilal Ahmed",
    category: "public",
    status: "flagged",
    createdAt: "2026-07-10",
    releaseDate: "—",
    views: 12,
  },
];

export default function MemoriesPage() {
  const [memories, setMemories] = useState(initialMemories);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return memories.filter((memory) => {
      const matchesSearch =
        memory.title.toLowerCase().includes(search.toLowerCase()) ||
        memory.owner.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || memory.category === category;
      const matchesStatus = status === "all" || memory.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [memories, search, category, status]);

  const removeMemory = (id: number) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    toast.success("Inappropriate content removed");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Memory Management"
        description="Search, filter, review scheduled/released memories, and remove inappropriate content."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Memories" value={String(memories.length)} icon={Heart} />
        <StatCard
          title="Scheduled"
          value={String(memories.filter((m) => m.status === "scheduled").length)}
          icon={CalendarClock}
        />
        <StatCard
          title="Released"
          value={String(memories.filter((m) => m.status === "released").length)}
          icon={Send}
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Memories</CardTitle>
            <Button
              variant="outline"
              onClick={() => toast.message("Memory analytics opened")}
            >
              <BarChart3 className="size-4" />
              View Analytics
            </Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((memory) => (
                <TableRow key={memory.id}>
                  <TableCell className="font-medium">{memory.title}</TableCell>
                  <TableCell>{memory.owner}</TableCell>
                  <TableCell>
                    <StatusBadge status={memory.category} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={memory.status} />
                  </TableCell>
                  <TableCell>{memory.createdAt}</TableCell>
                  <TableCell>{memory.releaseDate}</TableCell>
                  <TableCell>{memory.views}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            toast.message(`Analytics for "${memory.title}"`)
                          }
                        >
                          <BarChart3 className="size-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => removeMemory(memory.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Remove Content
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
    </div>
  );
}
