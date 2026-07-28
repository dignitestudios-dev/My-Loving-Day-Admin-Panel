"use client";

import { useState } from "react";
import { Plus, Send, Clock } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NotificationItem = {
  id: number;
  title: string;
  audience: string;
  type: string;
  status: string;
  scheduledFor: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Welcome to My Loving Day",
    audience: "All Users",
    type: "push",
    status: "sent",
    scheduledFor: "2026-07-01 09:00",
  },
  {
    id: 2,
    title: "Inactivity Reminder",
    audience: "Inactive Users",
    type: "reminder",
    status: "scheduled",
    scheduledFor: "2026-07-30 10:00",
  },
  {
    id: 3,
    title: "Premium Renewal Reminder",
    audience: "Premium Subscribers",
    type: "reminder",
    status: "sent",
    scheduledFor: "2026-07-20 11:00",
  },
  {
    id: 4,
    title: "Trusted Contact Check-in",
    audience: "User-specific",
    type: "user-specific",
    status: "sent",
    scheduledFor: "2026-07-25 14:00",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "All Users",
    type: "push",
    sendMode: "instant",
    scheduleAt: "",
    userEmail: "",
  });

  const createNotification = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    const scheduledFor =
      form.sendMode === "instant"
        ? new Date().toISOString().slice(0, 16).replace("T", " ")
        : form.scheduleAt || "Not set";

    setNotifications((prev) => [
      {
        id: Math.max(...prev.map((n) => n.id)) + 1,
        title: form.title,
        audience:
          form.audience === "User-specific" && form.userEmail
            ? form.userEmail
            : form.audience,
        type: form.type,
        status: form.sendMode === "instant" ? "sent" : "scheduled",
        scheduledFor,
      },
      ...prev,
    ]);

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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="reminder">Reminders</TabsTrigger>
          <TabsTrigger value="history">Delivery History</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <NotificationTable
            items={notifications}
            empty="No notifications yet."
          />
        </TabsContent>
        <TabsContent value="reminder" className="mt-4">
          <NotificationTable
            items={notifications.filter(
              (n) => n.type === "reminder" || n.type === "inactivity"
            )}
            empty="No reminder notifications."
          />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <NotificationTable
            items={notifications.filter((n) => n.status === "sent")}
            empty="No delivery history yet."
          />
        </TabsContent>
      </Tabs>

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
            <div className="grid gap-2">
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
            </div>
            <div className="grid gap-2">
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
            ) : null}
            <div className="grid gap-2">
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
            </div>
            {form.sendMode === "schedule" ? (
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
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNotification}>
              {form.sendMode === "instant" ? (
                <>
                  <Send className="size-4" />
                  Send Now
                </>
              ) : (
                <>
                  <Clock className="size-4" />
                  Schedule
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
}: {
  items: NotificationItem[];
  empty: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
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
              <TableRow key={item.id}>
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
          <p className="text-muted-foreground py-8 text-center text-sm">{empty}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
