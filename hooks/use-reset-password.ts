"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { resetPassword, type ResetPasswordPayload } from "@/lib/api/auth.api";
import { clearResetSession } from "@/lib/constants/reset-password";

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Failed to reset password");
        return;
      }

      clearResetSession();
      toast.success(data.message || "Password reset successfully");
      router.push("/auth/login");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to reset password. Please try again.";
      toast.error(message);
    },
  });
}
