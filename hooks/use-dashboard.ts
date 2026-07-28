"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboard,
  getDashboardGraph,
  type DashboardGraphParams,
} from "@/lib/api/dashboard.api";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
    select: (response) => response?.data?.data ?? null,
  });
}

export function useDashboardGraphQuery(params: DashboardGraphParams) {
  const enabled =
    params.type !== "custom" ||
    Boolean(params.startDate && params.endDate);

  return useQuery({
    queryKey: ["admin-dashboard-graph", params],
    queryFn: () => getDashboardGraph(params),
    select: (response) => response?.data ?? [],
    enabled,
  });
}
