import apiClient from "./api-client";
import create from "./http-service";
import type { Post } from "../models/post";

class PostService {
  endpoint = "/posts";

  getPostsByUserId(userId: string) {
    const controller = new AbortController();
    const request = apiClient.get<Post[]>(`${this.endpoint}/user/${userId}`, {
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort() };
  }

  createPost(data: any) {
    return apiClient.post(this.endpoint, data);
  }

  // Common CRUD operations inherited via 'create' pattern
  getAll() {
    return create(this.endpoint).getAll<Post>();
  }

  darleLike(postId: string) {
    return apiClient.patch<Post>(`${this.endpoint}/${postId}/like`);
  }

  getPostById(postId: string) {
    return apiClient.get<Post>(`${this.endpoint}/${postId}`);
  }

}

export default new PostService();
