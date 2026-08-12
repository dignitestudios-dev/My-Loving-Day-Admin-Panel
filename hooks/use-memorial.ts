import { useQuery } from "@tanstack/react-query";
import { getMemorials, MemorialRecord, MemorialResponse } from "@/lib/api/memorial.api";

type Params = {
  page: number;
  limit: number;
  search?: string;
};

export function useMemorials(params: Params) {
  return useQuery({
    queryKey: ["memorials", params.page, params.limit, params.search],
    queryFn: () => getMemorials(params),

  });
}
