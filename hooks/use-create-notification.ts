import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNotification } from '@/lib/api/notifications.api';

/**
 * Hook to create a new notification via POST.
 * It returns a mutation object with `mutateAsync` for async usage.
 * On success it invalidates the `notifications` query to refresh the list.
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation(
    {
      mutationFn: (payload: { title: string; description: string }) => createNotification(payload),
      onSuccess: () => {
        // Refetch the notifications list after creating a new one.
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    }
  );
}
