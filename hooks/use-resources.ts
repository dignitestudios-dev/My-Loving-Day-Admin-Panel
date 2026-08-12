import { useMutation, useQuery } from '@tanstack/react-query';
import { createResource, getResources, GetResourcesParams, ResourcesResponse } from '@/lib/api/resources.api';

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
    queryFn: () => getResources(id),
  });
}

export function useCreateResource() {
  return useMutation<ResourceDetailResponse, Error>({
    mutationFn: (body: { title: string; description: string; files: File[] }) => createResource(body),
  });
}

export function useUpdateResource() {
  return useMutation<ResourceDetailResponse, Error>({
    mutationFn: ({ id, body }: { id: string; body: { title: string; description: string; files: File[] } }) => updateResource(id, body),
  });
}

export function useDeleteResource() {
  return useMutation<ResourceDetailResponse, Error>({
    mutationFn: (id: string) => deleteResource(id),
  });
}