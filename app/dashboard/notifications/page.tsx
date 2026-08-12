"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Send, Clock } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { NotificationItem } from "@/lib/api/notifications.api";
import { useCreateNotification } from "@/hooks/use-create-notification";
import { useNotifications } from "@/hooks/use-notifications";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useNotifications({
    page,
    limit: PAGE_SIZE,
  });

  const notifications: NotificationItem[] = data?.data ?? [];

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "All Users",
    type: "push",
    sendMode: "instant",
    scheduleAt: "",
    userEmail: "",
  });

  const { mutateAsync: createNotificationMutate } = useCreateNotification();

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    setSubmitting(true);
    try {
      // NOTE: extending the payload to include the rest of the form fields your
      // useCreateNotification hook may expect. If its input type doesn't match,
      // TypeScript will flag exactly which field name/shape needs adjusting.
      await createNotificationMutate({
        title: form.title,
        description: form.message,


      });

      toast.success(
        form.sendMode === "instant"
          ? "Notification sent instantly"
          : "Notification scheduled"
      );
      setOpen(false);
      setForm({
        title: "",
        message: "",
        audience: "All Users",
        type: "push",
        sendMode: "instant",
        scheduleAt: "",
        userEmail: "",
      });
      refetch?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notification Management"
        description="Create, schedule, and track push, reminder, and user-specific notifications."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Create Notification
          </Button>
        }
      />

      <NotificationTable items={notifications} isLoading={isLoading} isError={isError} error={error} empty="No notifications yet." />

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isLoading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="text-muted-foreground text-sm">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || notifications.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="n-title">Title</Label>
              <Input
                id="n-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="n-message">Message</Label>
              <Textarea
                id="n-message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            {/* <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push Notification</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="inactivity">Inactivity Reminder</SelectItem>
                  <SelectItem value="user-specific">User-specific</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            {/* <div className="grid gap-2">
              <Label>Audience</Label>
              <Select
                value={form.audience}
                onValueChange={(value) => setForm({ ...form, audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Users">All Users</SelectItem>
                  <SelectItem value="Active Users">Active Users</SelectItem>
                  <SelectItem value="Inactive Users">Inactive Users</SelectItem>
                  <SelectItem value="Premium Subscribers">
                    Premium Subscribers
                  </SelectItem>
                  <SelectItem value="User-specific">User-specific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.audience === "User-specific" ? (
              <div className="grid gap-2">
                <Label htmlFor="user-email">User Email</Label>
                <Input
                  id="user-email"
                  placeholder="user@email.com"
                  value={form.userEmail}
                  onChange={(e) =>
                    setForm({ ...form, userEmail: e.target.value })
                  }
                />
              </div>
            ) : null} */}
            {/* <div className="grid gap-2">
              <Label>Delivery</Label>
              <Select
                value={form.sendMode}
                onValueChange={(value) => setForm({ ...form, sendMode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Send Instantly</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            {/* {form.sendMode === "schedule" ? (
              <div className="grid gap-2">
                <Label htmlFor="schedule-at">Schedule At</Label>
                <Input
                  id="schedule-at"
                  type="datetime-local"
                  value={form.scheduleAt}
                  onChange={(e) =>
                    setForm({ ...form, scheduleAt: e.target.value })
                  }
                />
              </div>
            ) : null} */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {form.sendMode === "instant" ? (
                <>
                  <Send className="size-4" />
                  {submitting ? "Sending..." : "Send Now"}
                </>
              ) : (
                <>
                  <Clock className="size-4" />
                  {submitting ? "Scheduling..." : "Schedule"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationTable({
  items,
  empty,
  isLoading,
  isError,
  error,
}: {
  items: NotificationItem[];
  empty: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Loading notifications...
          </p>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Failed to load notifications
            {error instanceof Error ? `: ${error.message}` : "."}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled / Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.audience}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>{item.scheduledFor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {items.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {empty}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}