"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Eye,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  TimerReset,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import users from "../data.json";

export default function InactiveUsersPage() {
  const [search, setSearch] = useState("");
  const [countdowns, setCountdowns] = useState<Record<number, number>>(
    Object.fromEntries(
      users
        .filter((u) => u.status === "inactive" || u.inactiveDays > 60)
        .map((u) => [u.id, Math.max(0, 90 - u.inactiveDays)])
    )
  );

  const inactiveUsers = useMemo(() => {
    return users
      .filter((u) => u.status === "inactive" || u.inactiveDays > 60)
      .filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
  }, [search]);

  const overrideTimer = (id: number) => {
    setCountdowns((prev) => ({ ...prev, [id]: 90 }));
    toast.success("Inactivity timer overridden to 90 days");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inactivity Trigger Management"
        description="Monitor inactive users, countdown status, and trusted contact activation."
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Inactive Users</CardTitle>
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              className="pl-9"
              placeholder="Search inactive users..."
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
                <TableHead>Inactive Days</TableHead>
                <TableHead>Countdown</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trusted Contacts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactiveUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.inactiveDays} days</TableCell>
                  <TableCell>
                    {countdowns[user.id] ?? 0} days remaining
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>{user.trustedContacts}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <Eye className="size-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            toast.success("Verification email sent")
                          }
                        >
                          <Mail className="size-4" />
                          Trigger Verification Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.success("Reminder notification sent")
                          }
                        >
                          <Bell className="size-4" />
                          Trigger Reminder Notification
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => overrideTimer(user.id)}>
                          <TimerReset className="size-4" />
                          Override Inactivity Timer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.success("Trusted contact process activated")
                          }
                        >
                          <Shield className="size-4" />
                          Activate Trusted Contact Process
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
