"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Users,
  Globe,
  Lock,
  Film,
  Mail,
  AtSign,
  Hash,
  Clock,
  BarChart3,
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePost } from "@/hooks/use-post";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDateTime(v?: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name?: string, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function formatSize(size: number) {
  if (!size || size === 0) return "Unknown";
  if (size < 1) return `${(size * 1024).toFixed(0)} KB`;
  return `${size.toFixed(2)} MB`;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function MemoryDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Stat chip ──────────────────────────────────────────────────────────────────
function StatChip({
  icon: Icon,
  label,
  value,
  bg,
  fg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  bg: string;
  fg: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center transition-shadow hover:shadow-sm">
      <div className={`flex size-10 items-center justify-center rounded-full ${bg}`}>
        <Icon className={`size-5 ${fg}`} />
      </div>
      <span className="text-2xl font-bold tabular-nums leading-none">
        {Math.max(0, value ?? 0).toLocaleString()}
      </span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
        {label}
      </span>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: res, isLoading, isError, error } = usePost(id);

  // Handle both { data: PostItem } and { data: { data: PostItem } } shapes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = (res as any)?.data?.data ?? (res as any)?.data;

  if (isLoading) return <MemoryDetailSkeleton />;

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Film className="size-12 text-muted-foreground/40" />
        <p className="text-destructive text-lg font-semibold">
          {(error as Error)?.message ?? "Memory not found."}
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/memories">
            <ArrowLeft className="size-4 mr-2" />
            Back to Memories
          </Link>
        </Button>
      </div>
    );
  }

  const stats = post.stats;
  const user = post.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const media: any[] = post.media ?? [];
  const thumbnail = post.thumbnail;
  const tags: string[] = post.tags ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon" className="mt-1 shrink-0">
            <Link href="/dashboard/memories">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <PageHeader
              title={post.title || "Untitled Memory"}
              description={`Posted by ${user?.name || "Unknown"} · ${formatDateTime(post.createdAt)}`}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={post.status} />
          <Badge variant="outline" className="gap-1.5 py-1 capitalize">
            {post.visibility === "followers" && <Users className="size-3" />}
            {post.visibility === "private" && <Lock className="size-3" />}
            {post.visibility === "public" && <Globe className="size-3" />}
            {post.visibility || "—"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Media */}
          {media.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Film className="size-4" /> Media Files
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {media.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`grid gap-4 ${media.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                    }`}
                >
                  {media.map((m) => (
                    <div
                      key={m._id}
                      className="flex flex-col overflow-hidden rounded-xl border bg-muted/20"
                    >
                      <div className="relative aspect-video w-full bg-black">
                        {m.mimetype?.startsWith("video") ? (
                          <video
                            src={m.location}
                            controls
                            poster={thumbnail?.location}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Image
                            src={m.location}
                            alt={m.filename}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 px-3 py-2.5">
                        <p className="truncate text-xs font-medium" title={m.filename}>
                          {m.filename}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="uppercase">{m.mimetype}</span>
                          <span>·</span>
                          <span>{formatSize(m.size)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoRow label="Title">{post.title || "—"}</InfoRow>
              <InfoRow label="Type">
                <span className="capitalize">{post.type || "—"}</span>
              </InfoRow>

              <div className="sm:col-span-2">
                <InfoRow label="Caption">
                  <p className="border-l-2 pl-3 text-sm font-normal italic leading-relaxed text-muted-foreground">
                    {post.caption || "No caption provided"}
                  </p>
                </InfoRow>
              </div>

              <InfoRow label="Status">
                <StatusBadge status={post.status} />
              </InfoRow>
              <InfoRow label="Visibility">
                <span className="inline-flex items-center gap-1.5 capitalize">
                  {post.visibility === "followers" && (
                    <Users className="size-3.5 text-muted-foreground" />
                  )}
                  {post.visibility === "private" && (
                    <Lock className="size-3.5 text-muted-foreground" />
                  )}
                  {post.visibility === "public" && (
                    <Globe className="size-3.5 text-muted-foreground" />
                  )}
                  {post.visibility || "—"}
                </span>
              </InfoRow>
              <InfoRow label="Created At">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {formatDateTime(post.createdAt)}
                </span>
              </InfoRow>
              <InfoRow label="Updated At">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {formatDateTime(post.updatedAt)}
                </span>
              </InfoRow>
              <InfoRow label="Scheduled At">
                {post.scheduledAt ? (
                  formatDateTime(post.scheduledAt)
                ) : (
                  <span className="text-muted-foreground font-normal text-sm">
                    Not scheduled
                  </span>
                )}
              </InfoRow>

              <div className="sm:col-span-2">
                <InfoRow label="Tags">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <Badge key={t} variant="secondary" className="gap-1">
                          <Hash className="size-3" />
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground font-normal text-sm">No tags</span>
                  )}
                </InfoRow>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="size-4" /> Engagement Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <StatChip
                    icon={Heart}
                    label="Likes"
                    value={stats.likesCount}
                    bg="bg-rose-100 dark:bg-rose-900/30"
                    fg="text-rose-600 dark:text-rose-400"
                  />
                  <StatChip
                    icon={MessageCircle}
                    label="Comments"
                    value={stats.commentsCount}
                    bg="bg-blue-100 dark:bg-blue-900/30"
                    fg="text-blue-600 dark:text-blue-400"
                  />
                  <StatChip
                    icon={Eye}
                    label="Views"
                    value={stats.viewsCount}
                    bg="bg-violet-100 dark:bg-violet-900/30"
                    fg="text-violet-600 dark:text-violet-400"
                  />
                  <StatChip
                    icon={Share2}
                    label="Shares"
                    value={stats.sharesCount}
                    bg="bg-emerald-100 dark:bg-emerald-900/30"
                    fg="text-emerald-600 dark:text-emerald-400"
                  />
                  <StatChip
                    icon={Gift}
                    label="Score"
                    value={stats.engagementScore}
                    bg="bg-amber-100 dark:bg-amber-900/30"
                    fg="text-amber-600 dark:text-amber-400"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Author</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-16 border-2 border-muted">
                  <AvatarImage src={user?.profilePicture?.location} />
                  <AvatarFallback className="text-base font-semibold">
                    {getInitials(user?.name, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <p className="font-semibold truncate">{user?.name || "—"}</p>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 truncate">
                    <AtSign className="size-3 shrink-0" />
                    {user?.userName || "—"}
                  </p>
                  <p className="text-muted-foreground text-xs flex items-center gap-1 truncate">
                    <Mail className="size-3 shrink-0" />
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                <span className="text-muted-foreground">Email verified</span>
                <span className="text-right font-medium">
                  {user?.isEmailVerified ? (
                    <span className="text-emerald-600">Yes</span>
                  ) : (
                    <span className="text-destructive">No</span>
                  )}
                </span>
                <span className="text-muted-foreground">Profile complete</span>
                <span className="text-right font-medium">
                  {user?.isProfileCompleted ? (
                    <span className="text-emerald-600">Yes</span>
                  ) : (
                    <span className="text-destructive">No</span>
                  )}
                </span>
                <span className="text-muted-foreground">Sign-in method</span>
                <span className="text-right font-medium capitalize">{user?.method || "—"}</span>
              </div>

              {user?.bio && (
                <>
                  <Separator />
                  <p className="border-l-2 pl-3 text-xs italic leading-relaxed text-muted-foreground">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                </>
              )}

              {user?._id && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/dashboard/users/${user._id}`}>View Full Profile</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}