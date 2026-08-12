"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Mic2,
  Shirt,
  Music,
  Paperclip,
  Heart,
  Mail,
  User,
  FileText,
  Search,
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useMemorial } from "@/hooks/use-memorial-detail";
import { CommentsSection } from "@/components/admin/comments-section";

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

function getInitials(name?: string) {
  if (!name?.trim()) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatSize(size: number) {
  if (!size || size === 0) return "Unknown";
  if (size < 1) return `${(size * 1024).toFixed(0)} KB`;
  return `${size.toFixed(2)} MB`;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function MemorialDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Info Row ───────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <span className="text-sm font-medium break-words">{value || <span className="text-muted-foreground font-normal italic">Not specified</span>}</span>
      </div>
    </div>
  );
}

// ── Media Item Card ────────────────────────────────────────────────────────────
function MediaCard({ description, file }: { description?: string; file: { _id: string; filename: string; location: string; mimetype: string; size: number } }) {
  const isVideo = file.mimetype?.startsWith("video");
  const isImage = file.mimetype?.startsWith("image");

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      {/* Preview */}
      <div className="relative aspect-video w-full bg-black">
        {isVideo ? (
          <video src={file.location} controls className="h-full w-full object-contain" />
        ) : isImage ? (
          <Image src={file.location} alt={file.filename} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="size-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      {/* Meta */}
      <div className="flex flex-col gap-1 px-3 py-2.5">
        {description && (
          <p className="text-sm font-medium text-foreground leading-snug">{description}</p>
        )}
        <p className="truncate text-xs font-medium text-muted-foreground" title={file.filename}>
          {file.filename}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="uppercase">{file.mimetype}</span>
          <span>·</span>
          <span>{formatSize(file.size)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Section with media grid ────────────────────────────────────────────────────
function MediaSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: { description: string; file: { _id: string; filename: string; location: string; mimetype: string; size: number } }[];
}) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="size-4" />
          {title}
          <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${items.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
          {items.map((item, idx) => (
            <MediaCard key={item.file._id ?? idx} description={item.description} file={item.file} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function MemorialPreferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: res, isLoading, isError, error } = useMemorial(id);
  console.log(res, "res")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = (res as any)?.data?.data ?? (res as any)?.data;

  if (isLoading) return <MemorialDetailSkeleton />;

  if (isError || !record) {

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Heart className="size-12 text-muted-foreground/30" />
        <p className="text-destructive text-lg font-semibold">
          {(error as Error)?.message ?? "Memorial record not found."}
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/memorial-preferences">
            <ArrowLeft className="size-4 mr-2" />
            Back to Memorial Preferences
          </Link>
        </Button>
      </div>
    );
  }

  const user = record.user;
  const music: { description: string; file: { _id: string; filename: string; location: string; mimetype: string; size: number } }[] = record.music ?? [];
  const lookForMe: { description: string; file: { _id: string; filename: string; location: string; mimetype: string; size: number } }[] = record.lookForMe ?? [];
  const attachments: { _id: string; filename: string; location: string; mimetype: string; size: number }[] = record.attachments ?? [];
  console.log(user, "record")
  return (
    <div className="flex flex-col gap-6">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button asChild variant="outline" size="icon" className="mt-1 shrink-0">
            <Link href="/dashboard/memorial-preferences">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <PageHeader
              title={user?.name ? `${user.name}'s Memorial Preferences` : "Memorial Preferences"}

            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Preferences Detail Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="size-4" /> Memorial Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border -mt-1">
              <InfoRow icon={FileText} label="Service Type" value={record.serviceType} />
              <InfoRow icon={MapPin} label="Venue" value={record.venue} />
              <InfoRow icon={Mic2} label="Speaker" value={record.speaker} />
              <InfoRow icon={Shirt} label="Dress Code" value={record.dressCode} />
              <div className="py-2.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
                    <Search className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Wishes</span>
                    {record.wishes ? (
                      <p className="text-sm leading-relaxed border-l-2 pl-3 italic text-muted-foreground">
                        {record.wishes}
                      </p>
                    ) : (
                      <span className="text-sm text-muted-foreground italic font-normal">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music */}
          <MediaSection title="Music" icon={Music} items={music} />

          {/* Look For Me */}
          <MediaSection title="Look For Me" icon={Search} items={lookForMe} />

          {/* Attachments */}
          {attachments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="size-4" />
                  Attachments
                  <Badge variant="secondary" className="ml-auto text-xs">{attachments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-4 ${attachments.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {attachments.map((att) => (
                    <MediaCard key={att._id} file={att} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">

          {/* User / Author */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submitted By</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-14 border-2 border-muted">
                  <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <p className="font-semibold truncate">{user?.name || "—"}</p>
                  <p className="text-muted-foreground text-xs flex items-center gap-1 truncate">
                    <Mail className="size-3 shrink-0" />{user?.email || "—"}
                  </p>
                </div>
              </div>

              {user?._id && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/dashboard/users/${user._id}`}>
                    <User className="size-4 mr-2" />
                    View Full Profile
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Created</span>
                  <span className="font-medium">{formatDateTime(record.createdAt)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Last Updated</span>
                  <span className="font-medium">{formatDateTime(record.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
        <CommentsSection postId={record._id} />
      </div>
    </div>
  );
}
