export interface Like {
  id: number;
  postId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LikeStatus {
  isLiked: boolean;
}

export interface LikeResponse {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface LikeError {
  error: string;
} 