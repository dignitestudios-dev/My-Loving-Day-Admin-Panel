import { API } from '@/lib/api/axios';

// ── Shared media shape ────────────────────────────────────────────────────────
export type MediaFile = {
  _id: string;
  filename: string;
  key: string;
  location: string;
  mimetype: string;
  size: number;
  createdAt: string;
  updatedAt: string;
};

// ── List item (from /admin/post list API) ─────────────────────────────────────
export type PostItem = {
  _id: string;
  id?: number;
  title: string;
  caption?: string;
  type?: string;
  status: string;
  visibility?: string;
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string | null;
  user?: {
    _id: string;
    name: string;
    userName?: string;
    email: string;
    profilePicture?: MediaFile;
  };
  media?: MediaFile[];
  thumbnail?: MediaFile;
  stats?: {
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    sharesCount: number;
    engagementScore: number;
  };
  settings?: {
    allowComments: boolean;
    allowSharing: boolean;
    allowGifts: boolean;
    allowDownloads: boolean;
  };
  tags?: string[];
};

// ── List response ─────────────────────────────────────────────────────────────
export type PostsResponse = {
  success: boolean;
  message: string;
  data: PostItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
};

// ── Single post detail response ───────────────────────────────────────────────
export type PostDetailResponse = {
  success: boolean;
  message: string;
  data: PostItem;
};

// ── Query params ──────────────────────────────────────────────────────────────
export type GetPostsParams = {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  category?: string;
};

// ── API calls ─────────────────────────────────────────────────────────────────
export async function getPosts(params: GetPostsParams) {
  const { data } = await API.get<PostsResponse>('/admin/post', { params });
  return data;
}

export async function getPost(id: string) {
  const { data } = await API.get<PostDetailResponse>(`/admin/post/${id}`);
  return data;
}
