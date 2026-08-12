import { useQuery } from '@tanstack/react-query';
import { getPost, PostItem } from '@/lib/api/posts.api';

export function usePost(id: string) {
  return useQuery<{ success: boolean; message: string; data: PostItem }, Error>({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
  });
}
