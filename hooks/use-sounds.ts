import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSounds,
  deleteSound,
  createSound,
  uploadAndCreateSound,
  GetSoundsParams,
  SoundsResponse,
  DeleteSoundResponse,
  CreateSoundPayload,
  CreateSoundResponse,
} from "@/lib/api/sounds.api";

export function useSounds(params: GetSoundsParams) {
  return useQuery<SoundsResponse, Error>({
    queryKey: ["sounds", params.page, params.limit, params.search],
    queryFn: () => getSounds(params),
  });
}

export function useDeleteSound() {
  const queryClient = useQueryClient();
  return useMutation<DeleteSoundResponse, Error, string>({
    mutationFn: (id: string) => deleteSound(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    },
  });
}

export function useCreateSound() {
  const queryClient = useQueryClient();
  return useMutation<CreateSoundResponse, Error, CreateSoundPayload>({
    mutationFn: (payload: CreateSoundPayload) => createSound(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    },
  });
}

export function useUploadAndCreateSound() {
  const queryClient = useQueryClient();
  return useMutation<
    CreateSoundResponse,
    Error,
    {
      file: File;
      cover?: File | null;
      name: string;
      duration: number;
      onProgress?: (step: string) => void;
    }
  >({
    mutationFn: (params) => uploadAndCreateSound(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    },
  });
}
