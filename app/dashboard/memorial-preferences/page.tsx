"use client";

import { useMemo, useState } from "react";
import { Download, Flag, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialRecords = [
  {
    id: 1,
    user: "Ayesha Khan",
    wish: "Scatter ashes at the family garden",
    completeness: "complete",
    updatedAt: "2026-07-10",
  },
  {
    id: 2,
    user: "Omar Farooq",
    wish: "Plant a tree in my memory",
    completeness: "incomplete",
    updatedAt: "2026-06-02",
  },
  {
    id: 3,
    user: "Sara Malik",
    wish: "Donate organs and share a message with kids",
    completeness: "complete",
    updatedAt: "2026-07-21",
  },
  {
    id: 4,
    user: "Hassan Raza",
    wish: "Private ceremony with trusted contacts only",
    completeness: "incomplete",
    updatedAt: "2026-05-18",
  },
  {
    id: 5,
    user: "Fatima Noor",
    wish: "Release scheduled memories over 1 year",
    completeness: "complete",
    updatedAt: "2026-07-15",
  },
];

export default function MemorialPreferencesPage() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return records.filter(
      (record) =>
        record.user.toLowerCase().includes(search.toLowerCase()) ||
        record.wish.toLowerCase().includes(search.toLowerCase())
    );
  }, [records, search]);

  const flagIncomplete = (id: number) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id
          ? { ...record, completeness: "flagged" }
          : record
      )
    );
    toast.success("Record flagged as incomplete");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Memorial Preferences"
        description="View memorial wishes, search records, export information, and flag incomplete entries."
        actions={
          <Button onClick={() => toast.success("Memorial records exported")}>
            <Download className="size-4" />
            Export Information
          </Button>
        }
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Memorial Wishes</CardTitle>
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              className="pl-9"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Memorial Wish</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.user}</TableCell>
                  <TableCell className="max-w-md">{record.wish}</TableCell>
                  <TableCell>
                    <StatusBadge status={record.completeness} />
                  </TableCell>
                  <TableCell>{record.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => flagIncomplete(record.id)}
                      disabled={record.completeness === "flagged"}
                    >
                      <Flag className="size-4" />
                      Flag Incomplete
                    </Button>
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
