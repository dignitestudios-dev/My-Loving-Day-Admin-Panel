"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  forgotPassword,
  type ForgotPasswordPayload,
} from "@/lib/api/auth.api";
import { RESET_EMAIL_KEY } from "@/lib/constants/reset-password";

type UseForgotPasswordOptions = {
  skipRedirect?: boolean;
};

export function useForgotPasswordMutation(options?: UseForgotPasswordOptions) {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
    onSuccess: (data, variables) => {
      if (!data?.success) {
        toast.error(data?.message || "Failed to send OTP");
        return;
      }

      sessionStorage.setItem(RESET_EMAIL_KEY, variables.email);
      toast.success(data.message || "OTP sent successfully");

      if (!options?.skipRedirect) {
        router.push(
          `/auth/verification?email=${encodeURIComponent(variables.email)}`
        );
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to send OTP. Please try again.";
      toast.error(message);
    },
  });
}
