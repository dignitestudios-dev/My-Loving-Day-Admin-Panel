"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  updatePassword,
  type UpdatePasswordPayload,
} from "@/lib/api/auth.api";

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updatePassword(payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Failed to update password");
        return;
      }
      toast.success(data.message || "Password updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to update password. Please try again.";
      toast.error(message);
    },
  });
}
