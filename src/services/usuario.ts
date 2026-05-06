import create from "./http";
import apiClient from "./api-client";
import type { PaginatedResponse } from "../models/pagination";
import type { Usuario } from "../models/usuario";

const service = create("/usuarios");

export const updateSelf = (data: any) => {
  return apiClient.patch("/auth/me", data);
};

export const getFollowers = (usuarioId: string, isAdmin: boolean = false) => {
  return apiClient.get(`/usuarios/followers/${usuarioId}`, { params: { isAdmin } });
};

export const getFollowing = (usuarioId: string, isAdmin: boolean = false) => {
  return apiClient.get(`/usuarios/following/${usuarioId}`, { params: { isAdmin } });
};

export const getUsers = (params?: any) => {
  return apiClient.get<PaginatedResponse<Usuario>>("/usuarios", { params });
};

export const searchUsers = (query: string, universidades: string[], page: number = 1, limit: number = 10) => {
  return apiClient.get<PaginatedResponse<Usuario>>("/usuarios", {
    params: {
      search: query,
      universidades: universidades?.join(","),
      page,
      limit
    },
  });
};

export const toggleFollow = (targetId: string) => {
  return apiClient.post(`/usuarios/follow/${targetId}`);
};

export const getUserById = (id: string) => {
  return apiClient.get<Usuario>(`/usuarios/${id}`);
};

const exportedService = {
  ...service,
  updateSelf,
  getFollowers,
  getFollowing,
  getUsers,
  searchUsers,
  toggleFollow,
  getUserById
};

export default exportedService;