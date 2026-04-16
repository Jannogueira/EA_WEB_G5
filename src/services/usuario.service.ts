import create from "./http-service";
import apiClient from "./api-client";

const service = create("/usuarios");

export const updateSelf = (data: any) => {
  return apiClient.patch("/auth/me", data);
};

export const getFollowers = (usuarioId: string) => {
  return apiClient.get(`/usuarios/followers/${usuarioId}`);
};

export const getFollowing = (usuarioId: string) => {
  return apiClient.get(`/usuarios/following/${usuarioId}`);
};

export const getUsers = () => {
  return apiClient.get("/usuarios");
};

export const searchUsers = (query: string) => {
  return apiClient.get("/usuarios", {
    params: { search: query }
  });
};

const exportedService = { 
  ...service, 
  updateSelf, 
  getFollowers, 
  getFollowing,
  getUsers,
  searchUsers
};

export default exportedService;