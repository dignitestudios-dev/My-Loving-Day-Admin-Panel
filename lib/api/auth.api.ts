import { API } from "./axios";
import {
  clearAuthCookies,
  setAuthToken,
  setAuthUser,
  type AuthUser,
} from "@/lib/utils/cookies";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: AuthUser;
  };
};

export async function loginAdmin(credentials: LoginCredentials) {
  const { data } = await API.post<LoginResponse>("/admin/login", credentials);

  if (data?.success && data.data?.token) {
    setAuthToken(data.data.token);
    setAuthUser(data.data.admin);
  }

  return data;
}

export async function logoutAdmin() {
  try {
    await API.post("/admin/logout");
  } catch {
    // Ignore logout API errors; always clear local auth
  } finally {
    clearAuthCookies();
  }
}

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
  data: {
    otp: number;
  };
};

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const { data } = await API.post<ForgotPasswordResponse>(
    "/admin/forgot-password",
    payload
  );
  return data;
}

export type VerifyOtpPayload = {
  email: string;
  otp: number;
};

export type VerifyOtpResponse = {
  success: boolean;
  message: string;
  data: {
    resetToken: string;
  };
};

export async function verifyOtp(payload: VerifyOtpPayload) {
  const { data } = await API.post<VerifyOtpResponse>(
    "/admin/verify-otp",
    payload
  );
  return data;
}

export type ResetPasswordPayload = {
  resetToken: string;
  password: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await API.post<ResetPasswordResponse>(
    "/admin/reset-password",
    payload
  );
  return data;
}

export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type UpdatePasswordResponse = {
  success: boolean;
  message: string;
};

export async function updatePassword(payload: UpdatePasswordPayload) {
  const { data } = await API.put<UpdatePasswordResponse>(
    "/admin/update-password",
    payload
  );
  return data;
}
