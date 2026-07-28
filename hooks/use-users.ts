"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getUserById,
  getUsers,
  type UsersListParams,
} from "@/lib/api/users.api";

export function useUsersQuery(params: UsersListParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => getUsers(params),
  });
}

export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => getUserById(userId),
    select: (response) => response?.data ?? null,
    enabled: Boolean(userId),
  });
}
