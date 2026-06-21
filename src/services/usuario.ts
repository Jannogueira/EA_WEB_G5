import create from './http';
import apiClient from './api-client';
import type { PaginatedResponse } from '../models/pagination';
import type { Usuario } from '../models/usuario';
import type { Universidad } from '../models/universidad';
import type { Grado } from '../models/grado';
import type { Asignatura } from '../models/asignatura';

const service = create('/usuarios');

export const updateSelf = (data: any) => {
  return apiClient.patch('/auth/me', data);
};

export const getFollowers = (usuarioId: string, isAdmin: boolean = false) => {
  return apiClient.get(`/usuarios/followers/${usuarioId}`, { params: { isAdmin } });
};

export const getFollowing = (usuarioId: string, isAdmin: boolean = false) => {
  return apiClient.get(`/usuarios/following/${usuarioId}`, { params: { isAdmin } });
};

export const getUsers = (params?: any) => {
  return apiClient.get<PaginatedResponse<Usuario>>('/usuarios', { params });
};

export const searchUsers = (
  query: string,
  allIds: string[],
  allUnis: Universidad[],
  allGrados: Grado[],
  allAsignaturas: Asignatura[],
  page: number = 1,
) => {
  const unis = allIds.filter((id) => allUnis.some((u) => u._id === id));
  const grados = allIds.filter((id) => allGrados.some((g) => g._id === id));
  const asigs = allIds.filter((id) => allAsignaturas.some((a) => a._id === id));

  return apiClient.get('/usuarios', {
    params: {
      search: query,
      universidades: unis.length > 0 ? unis.join(',') : undefined,
      grados: grados.length > 0 ? grados.join(',') : undefined,
      asignaturas: asigs.length > 0 ? asigs.join(',') : undefined,
      page,
      limit: 10,
    },
  });
};

export const toggleFollow = (targetId: string) => {
  return apiClient.post(`/usuarios/follow/${targetId}`);
};

export const getUserById = (id: string) => {
  return apiClient.get<Usuario>(`/usuarios/${id}`);
};

export const updateAsignaturas = (usuarioId: string, asignaturas: string[]) => {
  return apiClient.patch(`/usuarios/${usuarioId}/asignaturas`, { asignaturas });
};

export const acceptFollowRequest = (followerId: string) => {
  return apiClient.post(`/usuarios/requests/accept/${followerId}`);
};

export const rejectFollowRequest = (followerId: string) => {
  return apiClient.post(`/usuarios/requests/reject/${followerId}`);
};

export const updateFcmToken = (fcmToken: string | null) => {
  return apiClient.put('/usuarios/fcm-token', { fcmToken });
};

const exportedService = {
  ...service,
  updateSelf,
  getFollowers,
  getFollowing,
  getUsers,
  searchUsers,
  toggleFollow,
  getUserById,
  updateAsignaturas,
  acceptFollowRequest,
  rejectFollowRequest,
  updateFcmToken,
};

export default exportedService;
