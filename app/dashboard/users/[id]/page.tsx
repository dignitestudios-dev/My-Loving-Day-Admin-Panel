"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Shield,
  ShieldOff,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserQuery } from "@/hooks/use-users";
import type { AdminUser } from "@/lib/api/users.api";

function getInitials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAccountStatus(user: AdminUser) {
  if (user.isDeactivatedByAdmin) return "suspended";
  if (user.isDead) return "inactive";
  if (user.inactivity?.lifeCheckStatus === "inactive") return "inactive";
  return "active";
}

function formatSubscription(status: string) {
  if (!status || status === "NO_SUBSCRIPTION") return "free";
  return status.replaceAll("_", " ").toLowerCase();
}

function formatAddress(user: AdminUser) {
  const parts = [
    user.address?.street,
    user.address?.city,
    user.address?.state,
    user.address?.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function UserProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex w-full flex-col items-center gap-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading, isError, error, refetch, isFetching } =
    useUserQuery(id);

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="User Profile"
          description="Subscription, memories, and trusted contacts."
          actions={
            <Button variant="outline" asChild>
              <Link href="/dashboard/users">
                <ArrowLeft className="size-4" />
                Back to Users
              </Link>
            </Button>
          }
        />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{(error as Error)?.message || "Failed to load user details."}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const status = getAccountStatus(user);
  const subscription = formatSubscription(user.subscriptionStatus);
  const displayName = user.name || user.userName || user.email;
  const trustedFriends = user.trustedFriends ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Profile"
        description="Subscription, memories, and trusted contacts."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/users">
                <ArrowLeft className="size-4" />
                Back to Users
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Account activated")}
            >
              <UserCheck className="size-4" />
              Activate
            </Button>
            <Button
              variant="destructive"
              onClick={() => toast.success("Account suspended")}
            >
              <ShieldOff className="size-4" />
              Suspend
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <Avatar className="size-20">
              <AvatarImage
                src={user.profilePicture?.location}
                alt={displayName}
              />
              <AvatarFallback className="text-xl">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {user.userName ? (
                <p className="text-muted-foreground text-xs">@{user.userName}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <StatusBadge status={status} />
              <StatusBadge status={subscription} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Joined" value={formatDate(user.createdAt)} />
            <Detail
              label="Last Active"
              value={formatDateTime(user.inactivity?.lastActiveAt)}
            />
            <Detail label="Date of Birth" value={formatDate(user.dob)} />
            <Detail label="Address" value={formatAddress(user)} />
            <Detail label="Sign-in Method" value={user.method || "—"} />
            <Detail
              label="Email Verified"
              value={user.isEmailVerified ? "Yes" : "No"}
            />
            <Detail
              label="Profile Completed"
              value={user.isProfileCompleted ? "Yes" : "No"}
            />
            <Detail
              label="Memories Uploaded"
              value={String(user.uploadedMemoriesCount ?? 0)}
            />
            <Detail
              label="Inactivity Enabled"
              value={user.inactivity?.isEnabled ? "Yes" : "No"}
            />
            <Detail
              label="Inactivity Days"
              value={String(user.inactivity?.days ?? 0)}
            />
            <Detail
              label="Life Check Status"
              value={user.inactivity?.lifeCheckStatus || "—"}
            />
            <Detail
              label="Trusted Contacts"
              value={String(trustedFriends.length)}
            />
            {user.bio ? <Detail label="Bio" value={user.bio} /> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Trusted Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trustedFriends.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No trusted contacts found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trustedFriends.map((friend) => (
                  <TableRow key={friend._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={friend.profilePicture?.location}
                            alt={friend.name || friend.email}
                          />
                          <AvatarFallback>
                            {getInitials(friend.name, friend.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {friend.name || friend.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="size-3.5" />
                        {friend.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      {friend.userName ? `@${friend.userName}` : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={friend.trusted || friend.memories || "pending"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-medium break-words">{value}</p>
    </div>
  );
}
