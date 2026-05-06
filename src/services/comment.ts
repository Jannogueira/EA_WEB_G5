import apiClient from "./api-client";
import type { PaginatedResponse } from "../models/pagination";
import type { Comment } from "../models/comment";

export interface CommentData {
  post: string;
  texto: string;
}

class CommentService {
  getByPostId(postId: string, page: number = 1, limit: number = 20) {
    return apiClient.get<PaginatedResponse<Comment>>(`/comments/post/${postId}`, {
      params: { page, limit }
    });
  }

  create(data: CommentData) {
    return apiClient.post("/comments", data);
  }

  delete(commentId: string) {
    return apiClient.delete(`/comments/${commentId}`);
  }
}

export default new CommentService();