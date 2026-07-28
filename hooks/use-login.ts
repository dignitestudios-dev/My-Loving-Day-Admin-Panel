"use client";

import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { loginAdmin, type LoginCredentials } from "@/lib/api/auth.api";
import { setCredentials } from "@/lib/slices/authSlice";

export function useLoginMutation() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginAdmin(credentials),
    onSuccess: (data) => {
      if (!data?.success || !data.data?.token || !data.data?.admin) {
        toast.error(data?.message || "Login failed");
        return;
      }

      dispatch(
        setCredentials({
          user: data.data.admin,
          token: data.data.token,
        })
      );

      toast.success(data.message || "Admin logged in successfully");
      router.push("/dashboard");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to login. Please try again.";
      toast.error(message);
    },
  });
}
