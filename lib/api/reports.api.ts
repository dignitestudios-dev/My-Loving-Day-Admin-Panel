import { API } from "./axios";

export type ReportItem = {
  _id: string;
  reportedBy?: {
    _id: string;
    name: string;
    email: string;
    userName?: string;
  };
  reportedUser?: {
    _id: string;
    name: string;
    email: string;
    userName?: string;
  };
  reportedPost?: {
    _id: string;
    title?: string;
    caption?: string;
  };
  reason: string;
  description?: string;
  status?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportsResponse = {
  success: boolean;
  message: string;
  data: ReportItem[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
};

export type GetReportsParams = {
  page: number;
  limit: number;
  search?: string;
};

export type UpdateReportBody = {
  id: string;
  action: "accept" | "reject";
};
export type ReportsDashboardData = {
  pendingReports: number;
  resolvedReports: number;
  chatroomReports: number;
  messageReports: number;
  postReports: number;
  commentReports: number;
  userReports: number;
};

export type ReportsDashboardResponse = {
  success: boolean;
  message: string;
  data: ReportsDashboardData;
};
export type UpdateReportResponse = {
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export async function getReports(params: GetReportsParams) {
  const { data } = await API.get<ReportsResponse>("/admin/reports", { params });
  return data;
}

export async function updateReport(body: UpdateReportBody) {
  const { data } = await API.put<UpdateReportResponse>("/admin/reports", body);
  return data;
}
export async function getReportsDashboard() {
  const { data } = await API.get<ReportsDashboardResponse>("/admin/reports/dashboard");
  return data;
}