import { API } from "./axios";

export type NotificationItem = {
  _id: string;
  title: string;
  audience: string;
  type: string;
  status: string;
  scheduledFor: string;
  // other fields can be added as needed
};

export type NotificationsResponse = {
  success: boolean;
  message: string;
  data: NotificationItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
};

/**
 * Create a new notification.
 * @param payload.title - notification title
 * @param payload.description - notification description
 */
export async function createNotification(payload: { title: string; description: string }) {
  const { data } = await API.post<any>('/notification', payload);
  return data;
}

/**
 * Fetch admin notifications with pagination.
 * @param params.page - page number (1-indexed)
 * @param params.limit - items per page
 */
export async function getNotifications(params: { page: number; limit: number }) {
  const { data } = await API.get<NotificationsResponse>('/notification/admin', { params });
  return data;
}
