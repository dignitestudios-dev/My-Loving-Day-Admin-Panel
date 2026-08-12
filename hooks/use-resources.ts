import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createResource,
  deleteResource,
  getResource,
  getResources,
  GetResourcesParams,
  ResourceCreateBody,
  ResourceDetailResponse,
  ResourcesResponse,
  DeleteResourceResponse,
  updateResource,
} from '@/lib/api/resources.api';

export function useResources(params: GetResourcesParams) {
  return useQuery<ResourcesResponse, Error>({
    // Query key mein sab params daalein taake filter change hone par API dubara call ho
    queryKey: ['resources', params.page, params.limit, params.search, params.type],
    queryFn: () => getResources(params),
  });
}

export function useResourceDetail(id: string) {
  return useQuery<ResourceDetailResponse, Error>({
    queryKey: ['resource', id],
    queryFn: () => getResource(id),
    enabled: !!id,
  });
}

export function useCreateResource() {
  return useMutation<ResourceDetailResponse, Error, ResourceCreateBody>({
    mutationFn: (body) => createResource(body),
  });
}

export function useUpdateResource() {
  return useMutation<ResourceDetailResponse, Error, { id: string; body: ResourceCreateBody }>({
    mutationFn: ({ id, body }) => updateResource(id, body),
  });
}

export function useDeleteResource() {
  return useMutation<DeleteResourceResponse, Error, string>({
    mutationFn: (id) => deleteResource(id),
  });
}