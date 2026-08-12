import { useQuery } from '@tanstack/react-query';
import { getPosts, GetPostsParams, PostsResponse } from '@/lib/api/posts.api';

export function usePosts(params: GetPostsParams) {
  return useQuery<PostsResponse, Error>({
    queryKey: ['posts', params.page, params.limit, params.category, params.status, params.search],
    queryFn: () => getPosts(params),
  });
}
