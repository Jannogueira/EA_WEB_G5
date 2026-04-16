import create from "./http-service";
import apiClient from "./api-client";

const service = create("/usuarios");

export const updateSelf = (data: any) => {
  return apiClient.patch("/auth/me", data);
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
  getUsers,
  searchUsers
};

export default exportedService;