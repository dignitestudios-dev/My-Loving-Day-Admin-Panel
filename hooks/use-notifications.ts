import { useQuery } from "@tanstack/react-query";
import { getNotifications, NotificationItem, NotificationsResponse } from "@/lib/api/notifications.api";

type Params = {
  page: number;
  limit: number;
};

/**
 * React Query hook to fetch admin notifications with pagination.
 * Mirrors the pattern used in `useMemorials`.
 */
export function useNotifications(params: Params) {
  return useQuery<NotificationsResponse, Error>({
    queryKey: ["notifications", params.page, params.limit],
    queryFn: () => getNotifications(params),

  });
}
