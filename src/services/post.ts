import apiClient from "./api-client";
import create from "./http";
import type { Post } from "../models/post";
import type { PaginatedResponse } from "../models/pagination";

class PostService {
  endpoint = "/posts";

  getPostsByUserId(userId: string, page: number = 1, limit: number = 10) {
    const controller = new AbortController();
    const request = apiClient.get<PaginatedResponse<Post>>(`${this.endpoint}/user/${userId}`, {
      params: { page, limit },
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort() };
  }

  getFollowing(page: number = 1, limit: number = 10) {
    const controller = new AbortController();
    const request = apiClient.get<PaginatedResponse<Post>>(`${this.endpoint}/following`, {
      params: { page, limit },
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort() };
  }

  createPost(data: any) {
    return apiClient.post(this.endpoint, data);
  }

  // Common CRUD operations inherited via 'create' pattern
  getAll(params?: any) {
    return create(this.endpoint).getAll<Post>(params);
  }

  darleLike(postId: string) {
    return apiClient.patch<Post>(`${this.endpoint}/${postId}/like`);
  }

  getPostById(postId: string) {
    return apiClient.get<Post>(`${this.endpoint}/${postId}`);
  }

  getDiscoveryFeed(page: number = 1, limit: number = 10) {
    return apiClient.get<{ docs: Post[]; hasNextPage: boolean }>(
      `${this.endpoint}/discovery`,
      { params: { page, limit } }
    );
  }

  toggleSave(postId: string) {
    return apiClient.patch(`${this.endpoint}/${postId}/save`);
  }

  getSaved(page: number = 1, limit: number = 10) {
    return apiClient.get(`${this.endpoint}/saved`, {
      params: { page, limit }
    });
  }
}

export default new PostService();