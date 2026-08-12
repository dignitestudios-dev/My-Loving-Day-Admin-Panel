import { API } from "./axios";

export type UpdatePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export type UpdatePasswordResponse = {
  success: boolean;
  message: string;
};

export async function updatePassword(body: UpdatePasswordBody) {
  const { data } = await API.put<UpdatePasswordResponse>("/admin/update-password", body);
  return data;
}
