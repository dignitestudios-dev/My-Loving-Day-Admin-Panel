import { API } from "./axios";
import { filterSafeSearchInput } from "@/lib/utils/sanitize";

export type MediaFile = {
  _id: string;
  filename: string;
  key: string;
  location: string;
  mimetype: string;
  size: number;
  uploadedById: string;
  uploadedByModel: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaItem = {
  description: string;
  file: MediaFile;
};

export type MemorialRecord = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  serviceType: string;
  venue: string;
  speaker: string;
  dressCode: string;
  wishes: string;
  music: MediaItem[];
  lookForMe: MediaItem[];
  attachments: MediaFile[];
  createdAt: string;
  updatedAt: string;
};

export type MemorialResponse = {
  success: boolean;
  message: string;
  data: MemorialRecord[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
};

export type MemorialDetailResponse = {
  success: boolean;
  message: string;
  data: MemorialRecord;
};

export async function getMemorials(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const cleanSearch = params.search ? filterSafeSearchInput(params.search).trim() : undefined;
  const { data } = await API.get<MemorialResponse>("/admin/memorial", {
    params: {
      ...params,
      search: cleanSearch || undefined,
    },
  });
  return data;
}

export async function getMemorial(id: string) {
  const { data } = await API.get<MemorialDetailResponse>(`/admin/memorial/${id}`);
  return data;
}
