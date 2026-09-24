import axios from "axios";
import { API } from "./axios";

export type SoundFile = {
  _id: string;
  filename: string;
  key: string;
  location: string;
  mimetype: string;
  size: number;
  uploadedById?: string;
  uploadedByModel?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type SoundUser = {
  _id: string;
  method?: string;
  name: string | null;
  userName?: string | null;
  email: string;
  address?: any;
  profilePicture?: string | null;
  uid?: string | null;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type SoundItem = {
  _id: string;
  name: string;
  file: SoundFile;
  cover?: SoundFile | string | null;
  duration: number;
  user?: SoundUser | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type SoundsResponse = {
  success: boolean;
  message: string;
  data: SoundItem[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type GetSoundsParams = {
  page: number;
  limit: number;
  search?: string;
};

export async function getSounds(params: GetSoundsParams) {
  const { data } = await API.get<SoundsResponse>("/sound", {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

export type DeleteSoundResponse = {
  success: boolean;
  message: string;
};

export async function deleteSound(id: string) {
  const { data } = await API.delete<DeleteSoundResponse>(`/sound/${id}`);
  return data;
}

// ── Presigned URL & File Upload Types ──────────────────────────────────────────

export type PresignedUrlPayload = {
  fileName: string;
  contentType: string;
  folder: string;
};

export type PresignedUrlResponse = {
  success?: boolean;
  message?: string;
  data?: {
    url?: string;
    uploadUrl?: string;
    key?: string;
    location?: string;
    fileUrl?: string;
  };
  url?: string;
  uploadUrl?: string;
  key?: string;
  location?: string;
  fileUrl?: string;
};

export function getFileContentType(file: File): string {
  if (file.type && file.type.trim() !== "") {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    // Audio
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "m4a":
      return "audio/mp4";
    case "aac":
      return "audio/aac";
    case "ogg":
      return "audio/ogg";
    case "webm":
      return "audio/webm";
    case "flac":
      return "audio/flac";
    // Image / Cover
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function getPresignedUrl(payload: PresignedUrlPayload) {
  const { data } = await API.post<PresignedUrlResponse>(
    "/files/presigned-url",
    payload,
    {
      headers: {
        devicemodel: "IPhone 11 Pro",
        deviceuniqueid: "UUID_IPhone11Pro",
      },
    }
  );
  return data;
}

export async function uploadToS3(uploadUrl: string, file: File) {
  const contentType = getFileContentType(file);

  // 1. Direct browser fetch to S3 (Bypasses server payload limits entirely)
  try {
    const directResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": contentType,
      },
    });

    if (directResponse.ok) {
      return {
        status: directResponse.status,
        statusText: directResponse.statusText,
      };
    }

    const errText = await directResponse.text().catch(() => "");
    console.warn("Direct S3 PUT returned error status:", directResponse.status, errText);
  } catch (err) {
    console.warn(
      "Direct browser upload to S3 failed (CORS or network error). Attempting server proxy fallback...",
      err
    );
  }

  // 2. Fallback: Next.js API route proxy (Node.js runtime has no browser CORS restrictions)
  // Note: On Vercel / serverless deployments, requests larger than 4.5MB will return 413.
  const proxyResponse = await fetch("/api/upload-s3", {
    method: "PUT",
    body: file,
    headers: {
      "x-upload-url": uploadUrl,
      "x-content-type": contentType,
    },
  });

  if (proxyResponse.status === 413) {
    throw new Error(
      `Upload failed (413 Content Too Large): Audio file size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds serverless proxy limit. Please configure CORS on your AWS S3 bucket to allow direct browser uploads.`
    );
  }

  if (!proxyResponse.ok) {
    const errorJson = await proxyResponse.json().catch(() => ({}));
    throw new Error(
      errorJson.message ||
        `S3 upload failed with status ${proxyResponse.status}.`
    );
  }

  const result = await proxyResponse.json().catch(() => ({ status: 200 }));
  return {
    status: result.status || proxyResponse.status || 200,
    statusText: "OK",
  };
}

export type SaveFilePayload = {
  key: string;
  location: string;
  mimetype: string;
  filename: string;
  folder: string;
  size: number;
};

export type SaveFileResponse = {
  success?: boolean;
  message?: string;
  data?: {
    _id?: string;
    file?: {
      _id?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  _id?: string;
};

export async function saveFile(payload: SaveFilePayload) {
  const { data } = await API.post<SaveFileResponse>("/files/save", payload, {
    headers: {
      devicemodel: "IPhone 11 Pro",
      deviceuniqueid: "UUID_IPhone11Pro",
    },
  });
  return data;
}

// ── Single File Upload Orchestrator ──────────────────────────────────────────

export async function uploadSingleFile(
  file: File,
  folder = "sounds",
  onProgress?: (step: string) => void
): Promise<string> {
  const contentType = getFileContentType(file);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)}MB) cannot exceed maximum size of 5MB.`
    );
  }

  // 1. Get Presigned URL
  onProgress?.(`Requesting upload URL for ${file.name}...`);
  const presignedRes = await getPresignedUrl({
    fileName: file.name,
    contentType,
    folder,
  });

  const presignedData = presignedRes?.data || (presignedRes as any);
  const uploadUrl =
    presignedData?.uploadUrl ||
    presignedData?.url ||
    (presignedRes as any)?.uploadUrl ||
    (presignedRes as any)?.url;
  const key = presignedData?.key || (presignedRes as any)?.key || "";
  const location =
    presignedData?.location ||
    presignedData?.fileUrl ||
    (uploadUrl ? uploadUrl.split("?")[0] : "");

  if (!uploadUrl) {
    throw new Error(`Could not retrieve upload URL for ${file.name}.`);
  }

  // 2. Direct binary upload to S3 (with server proxy fallback if CORS blocks browser)
  onProgress?.(`Uploading ${file.name} to cloud storage...`);
  const uploadResponse = await uploadToS3(uploadUrl, file);

  if (!uploadResponse || uploadResponse.status < 200 || uploadResponse.status >= 300) {
    throw new Error(
      `Upload failed for ${file.name} with status ${uploadResponse?.status ?? "unknown"}.`
    );
  }

  // 3. Save file metadata in backend
  onProgress?.(`Saving file metadata for ${file.name}...`);
  const saveRes = await saveFile({
    key,
    location,
    mimetype: contentType,
    filename: file.name,
    folder,
    size: file.size,
  });

  const savedData =
    (saveRes as any)?.data?.file || (saveRes as any)?.data || (saveRes as any);
  const fileId = savedData?._id || (saveRes as any)?._id;

  if (!fileId) {
    throw new Error(`Could not save file record for ${file.name}.`);
  }

  return fileId;
}

// ── Create Sound API ─────────────────────────────────────────────────────────

export type CreateSoundPayload = {
  name: string;
  file: string; // Audio File ID returned from /files/save
  cover?: string; // Cover Image File ID returned from /files/save (optional)
  duration: number;
};

export type CreateSoundResponse = {
  success: boolean;
  message: string;
  data: SoundItem;
};

export async function createSound(payload: CreateSoundPayload) {
  const { data } = await API.post<CreateSoundResponse>("/sound", payload);
  return data;
}

// ── Upload & Create Workflow Helper ──────────────────────────────────────────

export async function uploadAndCreateSound(params: {
  file: File;
  cover?: File | null;
  name: string;
  duration: number;
  onProgress?: (step: string) => void;
}) {
  const { file, cover, name, duration, onProgress } = params;

  // 1. Upload Cover Photo if provided
  let coverFileId: string | undefined;
  if (cover) {
    onProgress?.("Uploading cover photo...");
    coverFileId = await uploadSingleFile(cover, "sounds", onProgress);
  }

  // 2. Upload Audio File
  onProgress?.("Uploading audio track...");
  const audioFileId = await uploadSingleFile(file, "sounds", onProgress);

  // 3. Create sound entry
  onProgress?.("Finalizing sound resource...");
  const createdSound = await createSound({
    name,
    file: audioFileId,
    ...(coverFileId ? { cover: coverFileId } : {}),
    duration,
  });

  return createdSound;
}
