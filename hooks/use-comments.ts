"use client";

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, getReplies, deleteComment, CommentsListResponse } from "@/lib/api/comments.api";

const COMMENTS_PAGE_SIZE = 10;
const REPLIES_PAGE_SIZE = 10;

// "Load more" pattern — pages accumulate hote jaate hain jab tak sab load na ho jayein
export function useComments(postId: string) {
    return useInfiniteQuery({
        queryKey: ["comments", postId],
        queryFn: ({ pageParam }) => getComments(postId, pageParam, COMMENTS_PAGE_SIZE),
        initialPageParam: 1,
        getNextPageParam: (lastPage: CommentsListResponse) =>
            lastPage.pagination.currentPage < lastPage.pagination.totalPages
                ? lastPage.pagination.currentPage + 1
                : undefined,
        enabled: !!postId,
    });
}

// Replies sirf tab fetch hongi jab "enabled" true ho (comment expand karne pe)
export function useReplies(commentId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["replies", commentId],
        queryFn: () => getReplies(commentId, 1, REPLIES_PAGE_SIZE),
        enabled: enabled && !!commentId,
    });
}

export function useDeleteComment(postId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteComment(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });
}