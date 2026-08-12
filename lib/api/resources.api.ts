import { API } from '@/lib/api/axios';

export type ResourceItem = {
  _id: string;
  title: string;
  description: string;
  resourceImg: { location: string; filename: string; mimetype: string }[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResourcesResponse = {
  success: boolean;
  message: string;
  data: ResourceItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
};

// Search aur type ko optional params banaya hai
export type GetResourcesParams = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
};

export type ResourceCreateBody = {
  title: string;
  description: string;
  files?: File | null;
};

export type CreateResourceResponse = {
  success: boolean;
  message: string;
  data: ResourceItem;
};

export async function getResources(params: GetResourcesParams) {
  const { data } = await API.get<ResourcesResponse>('/admin/resource', { params });
  return data;
}

export async function createResource(body: ResourceCreateBody) {
  const formData = new FormData();
  formData.append('title', body.title);
  formData.append('description', body.description);
  if (body.files) formData.append('files', body.files);
  const { data } = await API.post<CreateResourceResponse>('/admin/resource', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateResource(id: string, body: ResourceCreateBody) {
  const formData = new FormData();
  formData.append('title', body.title);
  formData.append('description', body.description);
  if (body.files) formData.append('files', body.files);
  const { data } = await API.patch<CreateResourceResponse>(`/admin/resource/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteResource(id: string) {
  const { data } = await API.delete<{ success: boolean; message: string }>(`/admin/resource/${id}`);
  return data;
}