export interface Comment {
  id: string;
  post_id: string;
  username: string;
  content: string;
  created_at: string;
}

export interface CommentResponse {
  id: string;
  post_id: string;
  username: string;
  content: string;
  created_at: string;
}

export interface CreateCommentRequest {
  postId: string;
  username: string;
  content: string;
}

export interface CommentError {
  error: string;
} 