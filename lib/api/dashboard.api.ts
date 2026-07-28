import { API } from "./axios";

export type DashboardStats = {
  totalUser: number;
  activeUsers: number;
  inActiveUsers: number;
  newUsers: number;
  totalPosts: number;
  scheduledPost: number;
  publisedPost: number;
  inactivity: number;
};

export type DashboardResponse = {
  success: boolean;
  message: string;
  data: {
    message?: string;
    data: DashboardStats;
  };
};

export async function getDashboard() {
  const { data } = await API.get<DashboardResponse>("/admin/dashboard");
  return data;
}

export type DashboardGraphType = "weekly" | "monthly" | "yearly" | "custom";

export type DashboardGraphPoint = {
  date: string;
  users: number;
  memories: number;
  subscriptions: number;
};

export type DashboardGraphParams = {
  type: DashboardGraphType;
  startDate?: string;
  endDate?: string;
};

export type DashboardGraphResponse = {
  success: boolean;
  message: string;
  data: DashboardGraphPoint[];
};

export async function getDashboardGraph(params: DashboardGraphParams) {
  const { data } = await API.get<DashboardGraphResponse>(
    "/admin/dashboard/graph",
    {
      params: {
        type: params.type,
        ...(params.type === "custom" && params.startDate
          ? { startDate: params.startDate }
          : {}),
        ...(params.type === "custom" && params.endDate
          ? { endDate: params.endDate }
          : {}),
      },
    }
  );
  return data;
}
