import { API } from "./axios";

export type CommentUser = {
    _id: string;
    name: string | null;
    profilePicture: string | null;
    email: string;
};

export type CommentItem = {
    _id: string;
    user: CommentUser;
    post?: string;
    parent: string | null;
    description: string;
    likes: number;
    replies: number;
    createdAt: string;
    updatedAt: string;
};

export type PaginationMeta = {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
};

export type CommentsListResponse = {
    success: boolean;
    message: string;
    data: CommentItem[];
    pagination: PaginationMeta;
};

export type DeleteCommentResponse = {
    success: boolean;
    message: string;
};

export async function getComments(postId: string, page: number, limit: number) {
    const { data } = await API.get<CommentsListResponse>(`/comments/post/${postId}`, {
        params: { page, limit },
    });
    return data;
}

export async function getReplies(commentId: string, page: number, limit: number) {
    const { data } = await API.get<CommentsListResponse>(`/comments/${commentId}/replies`, {
        params: { page, limit },
    });
    return data;
}

export async function deleteComment(id: string) {
    const { data } = await API.delete<DeleteCommentResponse>(`/comments/${id}`);
    return data;
}