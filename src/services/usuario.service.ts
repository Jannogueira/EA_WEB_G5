import create from "./http-service";
import apiClient from "./api-client";

const service = create("/usuarios");

export const updateSelf = (data: any) => {
  return apiClient.patch("/usuarios/profile/self", data);
};

const exportedService = { ...service, updateSelf };
export default exportedService;