"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  MoreHorizontal,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportItem = {
  id: number;
  type: "memory" | "comment";
  content: string;
  reportedBy: string;
  owner: string;
  reason: string;
  status: string;
  date: string;
};

const initialReports: ReportItem[] = [
  {
    id: 1,
    type: "memory",
    content: "Inappropriate Demo Clip",
    reportedBy: "Sara Malik",
    owner: "Bilal Ahmed",
    reason: "Inappropriate content",
    status: "pending",
    date: "2026-07-26",
  },
  {
    id: 2,
    type: "comment",
    content: "Offensive reply under Family Picnic",
    reportedBy: "Fatima Noor",
    owner: "Omar Farooq",
    reason: "Harassment",
    status: "pending",
    date: "2026-07-25",
  },
  {
    id: 3,
    type: "memory",
    content: "Spam public memory post",
    reportedBy: "Usman Tariq",
    owner: "Guest User",
    reason: "Spam",
    status: "reviewed",
    date: "2026-07-20",
  },
  {
    id: 4,
    type: "comment",
    content: "Repeated abusive language",
    reportedBy: "Ayesha Khan",
    owner: "Bilal Ahmed",
    reason: "Abuse",
    status: "warned",
    date: "2026-07-18",
  },
];

export default function ModerationPage() {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    return reports.filter((item) => {
      const matchesTab =
        tab === "all" ||
        (tab === "memories" && item.type === "memory") ||
        (tab === "comments" && item.type === "comment");
      const matchesSearch =
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.owner.toLowerCase().includes(search.toLowerCase()) ||
        item.reportedBy.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [reports, search, tab]);

  const updateStatus = (id: number, status: string) => {
    setReports((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Content Moderation"
        description="Review reported memories and comments, remove content, warn or ban users."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="memories">Reported Memories</TabsTrigger>
            <TabsTrigger value="comments">Reported Comments</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              className="pl-9"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell className="max-w-xs font-medium">
                        {item.content}
                      </TableCell>
                      <TableCell>{item.owner}</TableCell>
                      <TableCell>{item.reportedBy}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                updateStatus(item.id, "reviewed");
                                toast.success("Marked as reviewed");
                              }}
                            >
                              Review Flagged Content
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setReports((prev) =>
                                  prev.filter((r) => r.id !== item.id)
                                );
                                toast.success("Inappropriate content deleted");
                              }}
                            >
                              <Trash2 className="size-4" />
                              Delete Content
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                updateStatus(item.id, "warned");
                                toast.success("User warning issued");
                              }}
                            >
                              <TriangleAlert className="size-4" />
                              Warn User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                updateStatus(item.id, "banned");
                                toast.success("Repeat offender banned");
                              }}
                            >
                              <Ban className="size-4" />
                              Ban Repeat Offender
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No reports found.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
