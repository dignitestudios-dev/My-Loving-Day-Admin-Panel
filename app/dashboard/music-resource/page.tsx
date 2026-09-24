"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Search,
  Copy,
  Check,
  ExternalLink,
  Clock,
  User,
  Mail,
  FileAudio,
  ImageIcon,
  Eye,
  Trash2,
  Plus,
  UploadCloud,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Disc,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSounds, useDeleteSound, useUploadAndCreateSound } from "@/hooks/use-sounds";
import { SoundItem } from "@/lib/api/sounds.api";
import { getApiErrorMessage } from "@/lib/utils/error";
import { filterSafeSearchInput } from "@/lib/utils/sanitize";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────
function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function formatDuration(seconds?: number): string {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds <= 0) return "0s";
  if (seconds < 60) {
    return `${Number(seconds.toFixed(1))}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDateTime(v?: string | null): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return v;
  }
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Number(audio.duration.toFixed(2)) || 0);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(0);
    };
  });
}

function getSoundFileLocation(sound?: SoundItem | null): string | null {
  if (!sound) return null;
  const file = sound.file as any;
  if (!file) return null;
  if (typeof file === "string") return file;
  if (typeof file === "object") {
    return file.location || file.url || file.fileUrl || file.key || null;
  }
  return null;
}

function getCoverLocation(cover?: SoundItem["cover"]): string | null {
  if (!cover) return null;
  if (typeof cover === "string") return cover;
  if (typeof cover === "object") {
    const c = cover as any;
    return c.location || c.url || c.fileUrl || null;
  }
  return null;
}

export default function MusicResourcePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  // Persistent Audio Player State
  const [activeSound, setActiveSound] = useState<SoundItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Detail Modal State
  const [inspectSound, setInspectSound] = useState<SoundItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete State
  const [soundToDelete, setSoundToDelete] = useState<SoundItem | null>(null);
  const { mutate: deleteSoundMutation, isPending: isDeleting } = useDeleteSound();

  // Create / Upload Sound State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [soundName, setSoundName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewCoverUrl, setPreviewCoverUrl] = useState<string | null>(null);
  const [uploadStepMessage, setUploadStepMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const { mutate: uploadAndCreateSoundMutation, isPending: isUploading } =
    useUploadAndCreateSound();

  // Fetch sounds
  const { data, isLoading, isError, error, refetch, isFetching } = useSounds({
    page,
    limit,
    search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
  });

  const sounds = data?.data ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  // Handle audio file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validAudioExtensions = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".mpeg"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isAudioType = file.type.startsWith("audio/") || validAudioExtensions.includes(ext);

    if (!isAudioType) {
      toast.error("Please select a valid audio file (e.g. .mp3, .wav, .m4a)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_AUDIO_SIZE) {
      toast.error("Audio file size cannot exceed 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);

    // Auto-fill name if empty
    if (!soundName) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setSoundName(baseName);
    }

    const dur = await getAudioDuration(file);
    setDetectedDuration(dur);

    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setPreviewAudioUrl(previewUrl);
  };

  // Handle cover photo selection
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isImageType = file.type.startsWith("image/") || validImageExtensions.includes(ext);

    if (!isImageType) {
      toast.error("Please select an image file (e.g. .jpg, .png, .webp)");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_COVER_SIZE) {
      toast.error("Cover image size cannot exceed 5MB");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setSelectedCover(file);

    if (previewCoverUrl) {
      URL.revokeObjectURL(previewCoverUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setPreviewCoverUrl(previewUrl);
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCover(null);
    if (previewCoverUrl) {
      URL.revokeObjectURL(previewCoverUrl);
      setPreviewCoverUrl(null);
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handleResetCreateForm = () => {
    setSoundName("");
    setSelectedFile(null);
    setSelectedCover(null);
    setDetectedDuration(0);
    setUploadStepMessage(null);
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    if (previewCoverUrl) {
      URL.revokeObjectURL(previewCoverUrl);
      setPreviewCoverUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
    setIsCreateModalOpen(false);
  };

  const handleCreateSoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!soundName.trim()) {
      toast.error("Please enter a sound name");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select an audio file to upload");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Audio file size cannot exceed 5MB");
      return;
    }

    if (selectedCover && selectedCover.size > 5 * 1024 * 1024) {
      toast.error("Cover image size cannot exceed 5MB");
      return;
    }

    setUploadStepMessage("Initiating upload...");

    uploadAndCreateSoundMutation(
      {
        file: selectedFile,
        cover: selectedCover,
        name: soundName.trim(),
        duration: detectedDuration || 0.1,
        onProgress: (step) => setUploadStepMessage(step),
      },
      {
        onSuccess: () => {
          toast.success("Sound resource created successfully!");
          handleResetCreateForm();
          refetch();
        },
        onError: (err) => {
          setUploadStepMessage(null);
          const message = getApiErrorMessage(err, "Failed to create sound resource");
          toast.error(message);
        },
      }
    );
  };

  // ── Audio Playback Management (Direct & Resilient) ─────────────────────────
  const handleTogglePlay = async (sound: SoundItem) => {
    const soundUrl = getSoundFileLocation(sound);
    if (!soundUrl) {
      toast.error("Audio stream URL not found for this track");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    // Toggle same track
    if (activeSound?._id === sound._id) {
      if (isPlaying) {
        audio.pause();
      } else {
        try {
          setIsLoadingAudio(true);
          await audio.play();
        } catch (err: any) {
          if (err?.name !== "AbortError") {
            console.error("Audio resume error:", err);
            toast.error("Failed to resume playback.");
          }
        } finally {
          setIsLoadingAudio(false);
        }
      }
      return;
    }

    // Switch to new track
    try {
      setIsLoadingAudio(true);
      setActiveSound(sound);
      setCurrentTime(0);
      setAudioDuration(sound.duration || 0);

      audio.pause();
      audio.src = soundUrl;
      audio.load();
      await audio.play();
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Audio playback error:", err);
        toast.error("Unable to play audio. The stream may be restricted or unavailable.");
      }
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSeek = (newTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVol: number) => {
    const audio = audioRef.current;
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audio) {
      audio.volume = newVol;
      audio.muted = newVol === 0;
    }
  };

  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      audio.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const handleSkipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const maxDur = audio.duration || audioDuration || 9999;
    const target = Math.min(Math.max(0, audio.currentTime + seconds), maxDur);
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const handleStopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setActiveSound(null);
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setCurrentTime(0);
    setAudioDuration(0);
  };

  const openInspectModal = (sound: SoundItem) => {
    setInspectSound(sound);
  };

  const handleCopyUrl = (url?: string, id?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    toast.success("Audio URL copied to clipboard");
  };

  const handleConfirmDelete = () => {
    if (!soundToDelete) return;

    const id = soundToDelete._id;

    if (activeSound?._id === id) {
      handleStopAudio();
    }

    deleteSoundMutation(id, {
      onSuccess: () => {
        toast.success("Sound deleted successfully");
        setSoundToDelete(null);
        if (inspectSound?._id === id) {
          setInspectSound(null);
        }
        refetch();
      },
      onError: (err) => {
        const message = getApiErrorMessage(err, "Failed to delete sound");
        toast.error(message);
      },
    });
  };

  // Stats calculation
  const totalItemsCount = pagination?.totalItems ?? sounds.length;
  const avgDuration = useMemo(() => {
    if (sounds.length === 0) return "0s";
    const totalSec = sounds.reduce((acc, s) => acc + (s.duration || 0), 0);
    return formatDuration(totalSec / sounds.length);
  }, [sounds]);

  const totalStorageFormatted = useMemo(() => {
    if (sounds.length === 0) return "0 B";
    const totalBytes = sounds.reduce((acc, s) => acc + (s.file?.size || 0), 0);
    return formatFileSize(totalBytes);
  }, [sounds]);

  const inspectSoundFileUrl = getSoundFileLocation(inspectSound);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Hidden Audio Player instance */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          setIsLoadingAudio(false);
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
            setAudioDuration(e.currentTarget.duration);
          }
        }}
        onDurationChange={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
            setAudioDuration(e.currentTarget.duration);
          }
        }}
        onWaiting={() => setIsLoadingAudio(true)}
        onPlaying={() => {
          setIsLoadingAudio(false);
          setIsPlaying(true);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={(e) => {
          setIsLoadingAudio(false);
          setIsPlaying(false);
          const audioEl = e.currentTarget;
          if (audioEl.src && audioEl.error) {
            console.error("Audio playback error:", audioEl.error);
          }
        }}
        preload="auto"
      />

      {/* Page Header */}
      <PageHeader
        title="Music Resource"
        description="Browse, preview, create, and manage sound effects, background tracks, and audio clips."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              Upload Sound
            </Button>
          </div>
        }
      />

      {/* KPI Stats Overview */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sound Tracks"
          value={String(totalItemsCount)}
          icon={Music}
          tone="blue"
          hint="Total sounds available"
        />
        <StatCard
          title="Avg Duration"
          value={avgDuration}
          icon={Clock}
          tone="violet"
          hint="Average track length"
        />
        <StatCard
          title="Total File Size"
          value={totalStorageFormatted}
          icon={Layers}
          tone="teal"
          hint="Storage of loaded tracks"
        />
        <StatCard
          title="Audio Engine"
          value="MP3 / MPEG"
          icon={FileAudio}
          tone="rose"
          hint="Optimized for playback"
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="gap-4 border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">Sound Catalog</CardTitle>
                {isFetching && !isLoading && (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Manage audio resources, listen to inline previews, and inspect metadata.
              </p>
            </div>

            {/* Search and Limit controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64 md:w-80">
                <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  className="pl-9 pr-8"
                  placeholder="Search by track name, user, email..."
                  value={search}
                  onChange={(e) => setSearch(filterSafeSearchInput(e.target.value))}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5 text-xs font-semibold"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <Select
                value={String(limit)}
                onValueChange={(val) => setLimit(Number(val))}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isError && (
            <div className="m-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <Info className="size-4 shrink-0 text-red-600" />
                <p>{getApiErrorMessage(error, "Failed to load music resources.")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 bg-white hover:bg-red-100"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[60px] text-center">Play</TableHead>
                  <TableHead className="min-w-[240px]">Sound Track</TableHead>
                  <TableHead className="min-w-[140px]">Waveform</TableHead>
                  <TableHead className="min-w-[100px]">Duration</TableHead>
                  <TableHead className="min-w-[100px]">Size</TableHead>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                  <TableHead className="text-right pr-6 w-[90px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: limit }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-center">
                        <Skeleton className="size-8 rounded-full mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-10 rounded-lg shrink-0" />
                          <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : sounds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-primary/10 p-4">
                          <Music className="size-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground text-sm">No sound resources found</p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            {search
                              ? `No audio tracks matched "${search}". Try adjusting your search query.`
                              : "No audio tracks have been uploaded yet. Upload your first sound above."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {search && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSearch("")}
                              className="text-xs"
                            >
                              Clear Search Filters
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-xs gap-1.5"
                          >
                            <Plus className="size-3.5" />
                            Upload First Sound
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sounds.map((sound) => {
                    const isCurrentTrack = activeSound?._id === sound._id;
                    const isCurrentTrackPlaying = isCurrentTrack && isPlaying;
                    const isCurrentTrackLoading = isCurrentTrack && isLoadingAudio;
                    const coverUrl = getCoverLocation(sound.cover);

                    return (
                      <TableRow
                        key={sound._id}
                        className={cn(
                          "transition-colors group",
                          isCurrentTrack && "bg-primary/[0.04] dark:bg-primary/[0.08]"
                        )}
                      >
                        {/* Play / Pause button */}
                        <TableCell className="text-center py-3">
                          <button
                            type="button"
                            onClick={() => handleTogglePlay(sound)}
                            className={cn(
                              "flex size-8 items-center justify-center rounded-full transition-all duration-200 mx-auto shadow-sm cursor-pointer",
                              isCurrentTrackPlaying
                                ? "bg-primary text-primary-foreground scale-105 ring-2 ring-primary/30 shadow-primary/20"
                                : isCurrentTrackLoading
                                ? "bg-primary/20 text-primary animate-pulse"
                                : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105"
                            )}
                            title={
                              isCurrentTrackLoading
                                ? "Loading audio..."
                                : isCurrentTrackPlaying
                                ? "Pause Sound"
                                : "Play Sound"
                            }
                          >
                            {isCurrentTrackLoading ? (
                              <Loader2 className="size-3.5 animate-spin text-primary" />
                            ) : isCurrentTrackPlaying ? (
                              <Pause className="size-3.5 fill-current" />
                            ) : (
                              <Play className="size-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                        </TableCell>

                        {/* Track Info & Cover Photo */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Cover art thumbnail */}
                            <div
                              onClick={() => handleTogglePlay(sound)}
                              className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-xs flex items-center justify-center group-hover:border-primary/40 transition-colors cursor-pointer"
                              title={isCurrentTrackPlaying ? "Pause" : "Play"}
                            >
                              {coverUrl ? (
                                <img
                                  src={coverUrl}
                                  alt={sound.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Music className="size-4.5 text-muted-foreground/50" />
                              )}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span
                                onClick={() => handleTogglePlay(sound)}
                                className="font-medium text-foreground text-sm flex items-center gap-1.5 truncate cursor-pointer hover:text-primary transition-colors"
                              >
                                {sound.name || "Untitled Sound"}
                                {isCurrentTrackPlaying && (
                                  <span className="inline-block size-1.5 rounded-full bg-primary animate-ping shrink-0" />
                                )}
                              </span>
                              <span
                                className="text-[11px] text-muted-foreground truncate max-w-[200px]"
                                title={sound.file?.filename}
                              >
                                {sound.file?.filename || "sound.mp3"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Interactive Waveform / Mini Audio Progress */}
                        <TableCell className="py-3">
                          <div
                            className="flex items-center gap-2 max-w-[140px] cursor-pointer group/wave"
                            onClick={() => handleTogglePlay(sound)}
                            title={isCurrentTrackPlaying ? "Click to pause" : "Click to play"}
                          >
                            <div className="flex items-center gap-0.5 h-4">
                              {[35, 75, 25, 90, 45, 80, 50, 65].map((h, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "w-1 rounded-full transition-all duration-300",
                                    isCurrentTrackPlaying
                                      ? "bg-primary animate-pulse"
                                      : isCurrentTrack
                                      ? "bg-primary/50"
                                      : "bg-muted-foreground/30 group-hover/wave:bg-primary/40"
                                  )}
                                  style={{
                                    height: isCurrentTrackPlaying
                                      ? `${Math.max(20, (h * ((i % 3) + 1)) % 100)}%`
                                      : `${h * 0.35}%`,
                                    animationDelay: `${i * 100}ms`,
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {isCurrentTrack && (isPlaying || currentTime > 0)
                                ? `${currentTime.toFixed(1)}s`
                                : formatDuration(sound.duration)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Duration Badge */}
                        <TableCell className="py-3">
                          <Badge variant="outline" className="font-mono text-[11px] font-normal px-2 py-0.5 border-border/80">
                            <Clock className="size-3 mr-1 text-muted-foreground" />
                            {formatDuration(sound.duration)}
                          </Badge>
                        </TableCell>

                        {/* File Size */}
                        <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                          {formatFileSize(sound.file?.size)}
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(sound.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* Direct View Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => openInspectModal(sound)}
                              title="View Sound Details"
                            >
                              <Eye className="size-4" />
                              <span className="sr-only">View Details</span>
                            </Button>

                            {/* Direct Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setSoundToDelete(sound)}
                              title="Delete Sound"
                              disabled={isDeleting && soundToDelete?._id === sound._id}
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{pagination.currentPage}</span> of{" "}
                <span className="font-semibold text-foreground">{pagination.totalPages}</span> (
                {pagination.totalItems} total sounds)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="size-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Audio Player Dock (Active Track Control) */}
      {activeSound && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl rounded-2xl border bg-background/95 backdrop-blur-md shadow-2xl p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Left: Track Details */}
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center shadow-xs">
              {getCoverLocation(activeSound.cover) ? (
                <img
                  src={getCoverLocation(activeSound.cover)!}
                  alt={activeSound.name}
                  className="size-full object-cover"
                />
              ) : (
                <Music className="size-5 text-muted-foreground/50" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                  {activeSound.name}
                </span>
                {isPlaying && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary animate-pulse">
                    Playing
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground truncate max-w-[160px] sm:max-w-[200px]">
                {activeSound.file?.filename || "sound.mp3"}
              </span>
            </div>
          </div>

          {/* Center: Controls and Seek Bar */}
          <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto flex-1 max-w-md px-2">
            <div className="flex items-center gap-3">
              {/* Rewind 5s */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                onClick={() => handleSkipTime(-5)}
                title="Rewind 5 seconds"
              >
                <RotateCcw className="size-3.5" />
              </Button>

              {/* Play/Pause */}
              <Button
                type="button"
                size="icon"
                onClick={() => handleTogglePlay(activeSound)}
                className="size-9 rounded-full shadow-sm"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isLoadingAudio ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current ml-0.5" />
                )}
              </Button>

              {/* Forward 5s */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                onClick={() => handleSkipTime(5)}
                title="Skip 5 seconds"
              >
                <RotateCw className="size-3.5" />
              </Button>
            </div>

            {/* Scrubber Track */}
            <div className="flex items-center gap-2 w-full text-xs font-mono text-muted-foreground">
              <span className="text-[11px] min-w-[32px] text-right">
                {formatDuration(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={audioDuration || activeSound.duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="flex-1 h-1.5 bg-muted accent-primary cursor-pointer rounded-lg"
                title="Scrub playback position"
              />
              <span className="text-[11px] min-w-[32px]">
                {formatDuration(audioDuration || activeSound.duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            {/* Volume control */}
            <div className="hidden md:flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                onClick={handleToggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-3.5 text-destructive" />
                ) : (
                  <Volume2 className="size-3.5" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 h-1 bg-muted accent-primary cursor-pointer rounded-lg"
                title="Volume"
              />
            </div>

            {/* View Details */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => openInspectModal(activeSound)}
              title="View Track Details"
            >
              <Eye className="size-4" />
            </Button>

            {/* Close player */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleStopAudio}
              title="Stop & Close Player"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload New Sound Dialog */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open && !isUploading) {
            handleResetCreateForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="size-5 text-primary" />
              Upload Sound Resource
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSoundSubmit} className="space-y-4 py-2">
            {/* Sound Name */}
            <div className="space-y-1.5">
              <Label htmlFor="sound-name" className="text-xs font-semibold">
                Sound Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sound-name"
                placeholder="e.g. Gentle Bells, Joyful Chorus"
                value={soundName}
                onChange={(e) => setSoundName(e.target.value)}
                disabled={isUploading}
                required
              />
            </div>

            {/* Audio File Upload Drop Area */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Audio File <span className="text-destructive">*</span>
              </Label>

              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center",
                  selectedFile
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 bg-muted/20",
                  isUploading && "opacity-60 cursor-not-allowed"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />

                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <FileAudio className="size-5" />
                </div>

                {selectedFile ? (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs text-foreground truncate max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • Duration:{" "}
                      <span className="font-mono text-primary font-medium">
                        {formatDuration(detectedDuration)}
                      </span>
                    </p>
                    <p className="text-[10px] text-primary underline mt-1">
                      Click to change audio file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      Click or drag audio file here
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      MP3, WAV, M4A, AAC up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Preview Player in Modal */}
            {previewAudioUrl && (
              <div className="rounded-lg border bg-muted/40 p-2.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 text-[11px]">
                    <Play className="size-3 text-primary" /> Audio Preview
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {formatDuration(detectedDuration)}
                  </Badge>
                </div>
                <audio src={previewAudioUrl} controls className="w-full h-8" />
              </div>
            )}

            {/* Cover Photo Upload Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Cover Photo <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                </Label>
                {selectedCover && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCover}
                    className="h-6 px-1.5 text-[11px] text-destructive hover:text-destructive"
                    disabled={isUploading}
                  >
                    <X className="size-3 mr-1" />
                    Remove Cover
                  </Button>
                )}
              </div>

              <div
                onClick={() => !isUploading && coverInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors",
                  selectedCover
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 bg-muted/20",
                  isUploading && "opacity-60 cursor-not-allowed"
                )}
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleCoverSelect}
                  disabled={isUploading}
                />

                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative size-12 shrink-0 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                    {previewCoverUrl ? (
                      <img
                        src={previewCoverUrl}
                        alt="Cover Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 text-left">
                    <p className="font-medium text-xs text-foreground truncate">
                      {selectedCover ? selectedCover.name : "Select cover image"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedCover
                        ? formatFileSize(selectedCover.size)
                        : "JPG, PNG, WEBP up to 5MB"}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs h-7 pointer-events-none"
                >
                  {selectedCover ? "Change" : "Browse"}
                </Button>
              </div>
            </div>

            {/* Upload Progress Step Indicator */}
            {isUploading && uploadStepMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary font-medium animate-pulse">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                <span>{uploadStepMessage}</span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetCreateForm}
                disabled={isUploading}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !selectedFile || !soundName.trim()}
                size="sm"
                className="gap-2 ml-4"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Create Sound
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sound Inspector Dialog */}
      <Dialog open={!!inspectSound} onOpenChange={(open) => !open && setInspectSound(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Disc className="size-5 text-primary" />
              Sound Resource Details
            </DialogTitle>
          </DialogHeader>

          {inspectSound && (
            <div className="flex flex-col gap-4 py-2">
              {/* Cover Art & Player Header Card */}
              <div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {/* Cover Photo */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted flex items-center justify-center shadow-xs">
                    {getCoverLocation(inspectSound.cover) ? (
                      <img
                        src={getCoverLocation(inspectSound.cover)!}
                        alt={inspectSound.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Music className="size-8 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-foreground truncate text-base">
                        {inspectSound.name}
                      </h4>
                      <Badge variant="secondary" className="font-mono text-xs shrink-0">
                        {formatDuration(inspectSound.duration)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {inspectSound.file?.filename}
                    </p>
                  </div>
                </div>

                {/* Interactive Audio Player in Inspector */}
                {inspectSoundFileUrl ? (
                  <div className="rounded-lg border bg-background/80 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium flex items-center gap-1.5 text-foreground">
                        <FileAudio className="size-3.5 text-primary" />
                        Audio Player
                      </span>
                      <span className="font-mono">
                        {activeSound?._id === inspectSound._id
                          ? `${formatDuration(currentTime)} / ${formatDuration(audioDuration || inspectSound.duration)}`
                          : formatDuration(inspectSound.duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={activeSound?._id === inspectSound._id && isPlaying ? "default" : "outline"}
                        onClick={() => handleTogglePlay(inspectSound)}
                        className="gap-2 shrink-0 h-8"
                      >
                        {activeSound?._id === inspectSound._id && isLoadingAudio ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : activeSound?._id === inspectSound._id && isPlaying ? (
                          <Pause className="size-3.5 fill-current" />
                        ) : (
                          <Play className="size-3.5 fill-current" />
                        )}
                        <span>
                          {activeSound?._id === inspectSound._id && isPlaying ? "Pause" : "Play Track"}
                        </span>
                      </Button>

                      {activeSound?._id === inspectSound._id && (
                        <input
                          type="range"
                          min={0}
                          max={audioDuration || inspectSound.duration || 100}
                          step={0.1}
                          value={currentTime}
                          onChange={(e) => handleSeek(Number(e.target.value))}
                          className="flex-1 h-1.5 bg-muted accent-primary cursor-pointer rounded-lg"
                        />
                      )}
                    </div>

                    <details className="text-[11px] text-muted-foreground mt-1 cursor-pointer">
                      <summary className="hover:text-foreground">Native browser audio controls</summary>
                      <audio
                        src={inspectSoundFileUrl}
                        controls
                        className="w-full mt-2 h-8"
                        onPlay={() => {
                          if (audioRef.current && isPlaying && activeSound?._id !== inspectSound._id) {
                            audioRef.current.pause();
                          }
                        }}
                      />
                    </details>
                  </div>
                ) : (
                  <p className="text-xs text-destructive italic">Audio stream not available</p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border p-2.5 space-y-1">
                  <span className="text-muted-foreground uppercase font-medium tracking-wider text-[10px]">
                    MIME Type
                  </span>
                  <p className="font-mono text-foreground font-medium truncate">
                    {inspectSound.file?.mimetype || "audio/mpeg"}
                  </p>
                </div>

                <div className="rounded-lg border p-2.5 space-y-1">
                  <span className="text-muted-foreground uppercase font-medium tracking-wider text-[10px]">
                    File Size
                  </span>
                  <p className="font-mono text-foreground font-medium">
                    {formatFileSize(inspectSound.file?.size)}
                  </p>
                </div>

                <div className="rounded-lg border p-2.5 space-y-1">
                  <span className="text-muted-foreground uppercase font-medium tracking-wider text-[10px]">
                    Uploaded On
                  </span>
                  <p className="text-foreground font-medium">
                    {formatDateTime(inspectSound.createdAt)}
                  </p>
                </div>

                <div className="rounded-lg border p-2.5 space-y-1">
                  <span className="text-muted-foreground uppercase font-medium tracking-wider text-[10px]">
                    Sound ID
                  </span>
                  <p className="font-mono text-muted-foreground truncate" title={inspectSound._id}>
                    {inspectSound._id}
                  </p>
                </div>
              </div>

              {/* Uploader Card */}
              {inspectSound.user ? (
                <div className="rounded-xl border p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border bg-muted">
                      <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                        {getInitials(inspectSound.user?.name || inspectSound.user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {inspectSound.user?.name || "Unnamed User"}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {inspectSound.user?.email}
                      </span>
                      {inspectSound.user?.userName && (
                        <span className="text-[10px] text-primary">
                          @{inspectSound.user.userName}
                        </span>
                      )}
                    </div>
                  </div>

                  {inspectSound.user?._id && (
                    <Button asChild variant="outline" size="sm" className="shrink-0 text-xs">
                      <Link href={`/dashboard/users/${inspectSound.user._id}`}>
                        View Profile
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border p-3 flex items-center gap-3 bg-muted/20">
                  <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-foreground">
                      Admin / Platform Upload
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Uploaded directly via Admin Panel
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              {inspectSound && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const toDel = inspectSound;
                    setInspectSound(null);
                    setSoundToDelete(toDel);
                  }}
                  className="gap-1.5"
                >
                  <Trash2 className="size-4" />
                  Delete Sound
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {inspectSoundFileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopyUrl(inspectSoundFileUrl, inspectSound?._id)
                  }
                >
                  <Copy className="size-4 mr-2" />
                  Copy URL
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!soundToDelete}
        onOpenChange={(open) => !open && !isDeleting && setSoundToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete Sound Resource
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground font-semibold">
                &ldquo;{soundToDelete?.name}&rdquo;
              </strong>
              ? This action cannot be undone and will permanently remove this audio track from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setSoundToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete Sound"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
