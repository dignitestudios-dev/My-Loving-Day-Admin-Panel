import { API } from "./axios";

export type UserProfilePicture = {
  _id: string;
  filename: string;
  key: string;
  location: string;
  mimetype: string;
  size: number;
} | null;

export type TrustedFriend = {
  _id: string;
  name: string | null;
  email: string;
  userName: string | null;
  profilePicture: UserProfilePicture;
  memories?: string;
  trusted?: string;
  trustInitiatedBy?: string;
  friendshipId?: string;
};

export type UserInactivity = {
  isEnabled: boolean;
  days: number;
  lastActiveAt: string | null;
  lifeCheckStatus: string;
  lifeCheckStartedAt: string | null;
  userNotifiedAt: string | null;
  friendsNotifiedAt: string | null;
};

export type AdminUser = {
  _id: string;
  name: string | null;
  email: string;
  userName: string | null;
  profilePicture: UserProfilePicture;
  method: string;
  bio?: string;
  dob: string | null;
  address: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    location?: {
      type?: string;
      coordinates?: number[];
    };
  } | null;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  isDeactivatedByAdmin: boolean;
  isDead: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptionStatus: string;
  uploadedMemoriesCount: number;
  trustedFriends: TrustedFriend[];
  inactivity: UserInactivity;
};

export type UsersListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type UsersListResponse = {
  success: boolean;
  message: string;
  data: {
    users: AdminUser[];
    exportCsv: string | null;
  };
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type UserDetailResponse = {
  success: boolean;
  message: string;
  data: AdminUser;
};

export async function getUsers(params: UsersListParams = {}) {
  const { data } = await API.get<UsersListResponse>("/admin/users", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search ?? "",
    },
  });
  return data;
}

export async function getUserById(userId: string) {
  const { data } = await API.get<UserDetailResponse>(`/admin/users/${userId}`);
  return data;
}
