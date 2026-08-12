import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReports, getReportsDashboard, GetReportsParams, ReportsResponse, updateReport, UpdateReportBody, UpdateReportResponse } from "@/lib/api/reports.api";

export function useReports(params: GetReportsParams) {
  return useQuery<ReportsResponse, Error>({
    queryKey: ["reports", params.page, params.limit, params.search],
    queryFn: () => getReports(params),
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation<UpdateReportResponse, Error, UpdateReportBody>({
    mutationFn: (body) => updateReport(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
export function useReportsDashboard() {
  return useQuery({
    queryKey: ["reports-dashboard"],
    queryFn: getReportsDashboard,
  });
}