"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Trash2, ChevronDown, ChevronUp, Loader2, Check, X, Heart } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useComments, useReplies, useDeleteComment } from "@/hooks/use-comments";
import type { CommentItem } from "@/lib/api/comments.api";

// ── Helpers ──────────────────────────────────────────────────────────────
function getInitials(name?: string | null, email?: string) {
    if (name?.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
}

function timeAgo(v?: string) {
    if (!v) return "—";
    const diffSec = Math.floor((Date.now() - new Date(v).getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Delete button jo click pe inline confirm dikhata hai ──────────────────
function DeleteAction({ onConfirm, isPending }: { onConfirm: () => void; isPending: boolean }) {
    const [confirming, setConfirming] = useState(false);

    if (confirming) {
        return (
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-green-600 hover:bg-green-50 hover:text-green-700"
                    disabled={isPending}
                    onClick={onConfirm}
                    title="Confirm delete"
                >
                    {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    disabled={isPending}
                    onClick={() => setConfirming(false)}
                    title="Cancel"
                >
                    <X className="size-3.5" />
                </Button>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-destructive"
            onClick={() => setConfirming(true)}
            title="Delete"
        >
            <Trash2 className="size-3.5" />
        </Button>
    );
}

// ── Ek reply row ────────────────────────────────────────────────────────
function ReplyRow({ reply, postId }: { reply: CommentItem; postId: string }) {
    const { mutate: removeComment, isPending } = useDeleteComment(postId);

    return (
        <div className="group ml-4 flex items-start gap-2.5 border-l-2 border-muted py-2.5 pl-4">
            <Avatar className="size-7 shrink-0">
                <AvatarImage src={reply.user?.profilePicture || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                    {getInitials(reply.user?.name, reply.user?.email)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{reply.user?.name || reply.user?.email || "—"}</span>
                    <span className="text-muted-foreground text-xs">{timeAgo(reply.createdAt)}</span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm break-words">{reply.description}</p>
                {reply.likes > 0 && (
                    <span className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <Heart className="size-3" /> {reply.likes}
                    </span>
                )}
            </div>
            <DeleteAction
                isPending={isPending}
                onConfirm={() =>
                    removeComment(reply._id, {
                        onSuccess: () => toast.success("Reply deleted"),
                        onError: (err) => toast.error(err?.message ?? "Failed to delete reply"),
                    })
                }
            />
        </div>
    );
}

// ── Ek comment row (replies lazy-load hoti hain) ───────────────────────
function CommentRow({ comment, postId }: { comment: CommentItem; postId: string }) {
    const [showReplies, setShowReplies] = useState(false);
    const { mutate: removeComment, isPending } = useDeleteComment(postId);
    const { data: repliesRes, isLoading: repliesLoading } = useReplies(comment._id, showReplies);

    const replies = repliesRes?.data ?? [];

    return (
        <div className="py-3">
            <div className="group flex items-start gap-3">
                <Avatar className="size-9 shrink-0">
                    <AvatarImage src={comment.user?.profilePicture || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(comment.user?.name, comment.user?.email)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{comment.user?.name || comment.user?.email || "—"}</span>
                        <span className="text-muted-foreground text-xs">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-sm break-words">{comment.description}</p>

                    <div className="mt-1.5 flex items-center gap-3">
                        {comment.likes > 0 && (
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                <Heart className="size-3" /> {comment.likes}
                            </span>
                        )}
                        {comment.replies > 0 && (
                            <button
                                className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
                                onClick={() => setShowReplies((prev) => !prev)}
                            >
                                {showReplies ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                                {showReplies ? "Hide" : "View"} {comment.replies} {comment.replies === 1 ? "reply" : "replies"}
                            </button>
                        )}
                    </div>
                </div>
                <DeleteAction
                    isPending={isPending}
                    onConfirm={() =>
                        removeComment(comment._id, {
                            onSuccess: () => toast.success("Comment deleted"),
                            onError: (err) => toast.error(err?.message ?? "Failed to delete comment"),
                        })
                    }
                />
            </div>

            {showReplies && (
                <div className="mt-1">
                    {repliesLoading ? (
                        <div className="text-muted-foreground ml-4 flex items-center gap-2 py-2 pl-4 text-xs">
                            <Loader2 className="size-3 animate-spin" /> Loading replies...
                        </div>
                    ) : replies.length === 0 ? (
                        <p className="text-muted-foreground ml-4 py-2 pl-4 text-xs italic">No replies found.</p>
                    ) : (
                        replies.map((reply) => <ReplyRow key={reply._id} reply={reply} postId={postId} />)
                    )}
                </div>
            )}
        </div>
    );
}

function CommentsSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main export ──────────────────────────────────────────────────────────
export function CommentsSection({ postId }: { postId: string }) {
    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useComments(postId);

    const comments = data?.pages.flatMap((page) => page.data) ?? [];
    const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="size-4" /> Comments
                    {totalItems > 0 && (
                        <span className="text-muted-foreground text-sm font-normal">({totalItems})</span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <CommentsSkeleton />
                ) : isError ? (
                    <p className="text-destructive text-sm">
                        {(error as Error)?.message ?? "Failed to load comments."}
                    </p>
                ) : comments.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center gap-2 py-8">
                        <MessageCircle className="size-8 opacity-30" />
                        <p className="text-sm">No comments yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y">
                        {comments.map((comment) => (
                            <CommentRow key={comment._id} comment={comment} postId={postId} />
                        ))}
                    </div>
                )}

                {hasNextPage && (
                    <div className="mt-4 flex justify-center">
                        <Button variant="outline" size="sm" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" /> Loading...
                                </>
                            ) : (
                                "Load more comments"
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}