import { useQuery } from "@tanstack/react-query";
import { getMemorial, MemorialRecord } from "@/lib/api/memorial.api";

export function useMemorial(id: string) {
  return useQuery<{ success: boolean; message: string; data: MemorialRecord }, Error>({
    queryKey: ["memorial", id],
    queryFn: () => getMemorial(id),
    enabled: !!id,
  });
}
