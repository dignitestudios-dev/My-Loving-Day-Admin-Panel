"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  MoreHorizontal,
  RefreshCw,
  Search,
  XCircle,
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
import { CheckCircle2, AlertTriangle } from "lucide-react";

const initialDeliveries = [
  {
    id: 1,
    memory: "Our Wedding Day",
    recipient: "Ali Khan",
    scheduledFor: "2026-08-15 10:00",
    status: "upcoming",
  },
  {
    id: 2,
    memory: "Letter to My Daughter",
    recipient: "Hira Malik",
    scheduledFor: "2026-07-01 09:00",
    status: "delivered",
  },
  {
    id: 3,
    memory: "Birthday Surprise Video",
    recipient: "Ahmed Noor",
    scheduledFor: "2026-09-15 18:30",
    status: "upcoming",
  },
  {
    id: 4,
    memory: "Advice for Hard Days",
    recipient: "Farah Farooq",
    scheduledFor: "2026-07-20 12:00",
    status: "failed",
  },
  {
    id: 5,
    memory: "Family Picnic 2024",
    recipient: "Public Feed",
    scheduledFor: "2026-01-01 00:00",
    status: "delivered",
  },
];

export default function ScheduledDeliveriesPage() {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return deliveries.filter((item) => {
      const matchesSearch =
        item.memory.toLowerCase().includes(search.toLowerCase()) ||
        item.recipient.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || item.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, status]);

  const updateStatus = (id: number, next: string) => {
    setDeliveries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: next } : item))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Scheduled Deliveries"
        description="Manage upcoming, delivered, and failed memory deliveries."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Upcoming"
          value={String(deliveries.filter((d) => d.status === "upcoming").length)}
          icon={CalendarClock}
        />
        <StatCard
          title="Delivered"
          value={String(deliveries.filter((d) => d.status === "delivered").length)}
          icon={CheckCircle2}
        />
        <StatCard
          title="Failed"
          value={String(deliveries.filter((d) => d.status === "failed").length)}
          icon={AlertTriangle}
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Delivery Queue</CardTitle>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                className="pl-9"
                placeholder="Search deliveries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Memory</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.memory}</TableCell>
                  <TableCell>{item.recipient}</TableCell>
                  <TableCell>{item.scheduledFor}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
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
                            toast.success("Delivery rescheduled");
                            updateStatus(item.id, "upcoming");
                          }}
                        >
                          <CalendarClock className="size-4" />
                          Reschedule
                        </DropdownMenuItem>
                        {item.status === "failed" ? (
                          <DropdownMenuItem
                            onClick={() => {
                              toast.success("Retry queued");
                              updateStatus(item.id, "upcoming");
                            }}
                          >
                            <RefreshCw className="size-4" />
                            Retry Failed Delivery
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => {
                            setDeliveries((prev) =>
                              prev.filter((d) => d.id !== item.id)
                            );
                            toast.success("Delivery cancelled");
                          }}
                        >
                          <XCircle className="size-4" />
                          Cancel Delivery
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
