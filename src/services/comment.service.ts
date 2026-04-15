import apiClient from "./api-client";

export interface CommentData {
  //usuario: string;
  post: string;
  texto: string;
}

class CommentService {
  getByPostId(postId: string) {
    return apiClient.get(`/comments/post/${postId}`);
  }

  create(data: CommentData) {
    return apiClient.post("/comments", data);
  }

  delete(commentId: string) {
    return apiClient.delete(`/comments/${commentId}`);
  }
}

export default new CommentService();