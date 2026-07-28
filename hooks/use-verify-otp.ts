"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { verifyOtp, type VerifyOtpPayload } from "@/lib/api/auth.api";
import {
  RESET_EMAIL_KEY,
  RESET_TOKEN_KEY,
} from "@/lib/constants/reset-password";

export function useVerifyOtpMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    onSuccess: (data, variables) => {
      if (!data?.success || !data.data?.resetToken) {
        toast.error(data?.message || "Invalid OTP");
        return;
      }

      sessionStorage.setItem(RESET_EMAIL_KEY, variables.email);
      sessionStorage.setItem(RESET_TOKEN_KEY, data.data.resetToken);
      toast.success(data.message || "OTP verified successfully");
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(variables.email)}`
      );
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to verify OTP. Please try again.";
      toast.error(message);
    },
  });
}
