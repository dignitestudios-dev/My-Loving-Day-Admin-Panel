"use client";

import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Heart,
  CalendarClock,
  Send,
  Timer,
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { DashboardGraph } from "@/components/admin/dashboard-graph";
import { useDashboardQuery } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardQuery();

  const cards = [
    {
      title: "Total Users",
      value: data?.totalUser ?? 0,
      icon: Users,
      tone: "blue" as const,
    },
    {
      title: "Active Users",
      value: data?.activeUsers ?? 0,
      icon: UserCheck,
      tone: "green" as const,
    },
    {
      title: "Inactive Users",
      value: data?.inActiveUsers ?? 0,
      icon: UserX,
      tone: "slate" as const,
    },
    {
      title: "New Users",
      value: data?.newUsers ?? 0,
      icon: UserPlus,
      tone: "sky" as const,
    },
    {
      title: "Total Posts",
      value: data?.totalPosts ?? 0,
      icon: Heart,
      tone: "rose" as const,
    },
    {
      title: "Scheduled Posts",
      value: data?.scheduledPost ?? 0,
      icon: CalendarClock,
      tone: "amber" as const,
    },
    {
      title: "Published Posts",
      value: data?.publisedPost ?? 0,
      icon: Send,
      tone: "teal" as const,
    },
    {
      title: "Inactivity",
      value: data?.inactivity ?? 0,
      icon: Timer,
      tone: "violet" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of users and posts activity."
      />

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>
            {(error as Error)?.message || "Failed to load dashboard data."}
          </p>
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
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="space-y-2.5 rounded-xl border bg-white p-3.5 shadow-sm"
              >
                <Skeleton className="size-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            ))
          : cards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={String(card.value)}
                icon={card.icon}
                tone={card.tone}
              />
            ))}
      </div>

      <DashboardGraph />
    </div>
  );
}
